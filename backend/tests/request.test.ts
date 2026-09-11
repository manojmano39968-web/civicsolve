import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('Service Request Lifecycle & State Machine (Milestone 7)', () => {
  let neederToken: string;
  let neederId: string;
  let providerToken: string;
  let providerUserId: string;
  let providerProfileId: string;
  let otherUserToken: string;
  let plumbingServiceId: string;

  beforeAll(async () => {
    await runSeeds();

    const ts = Date.now();

    // 1. Get plumbing service ID
    const taxRes = await request(app).get('/api/v1/taxonomy/services');
    const plumberSvc = taxRes.body.data.find((s: any) => s.slug === 'plumber');
    plumbingServiceId = plumberSvc.id;

    // 2. Register Solution Needer
    const neederRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `needer_${ts}@civicsolve.org`,
        password: 'Password@123',
        fullName: 'Arjun Needer',
        phone: '9876543210',
        role: 'NEEDER',
      });
    neederToken = neederRes.body.data.accessToken;
    neederId = neederRes.body.data.user.id;

    // 3. Register Problem Solver User
    const providerUserRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `provider_${ts}@civicsolve.org`,
        password: 'Password@123',
        fullName: 'Kavitha Plumber',
        phone: '9876543211',
        role: 'PROVIDER',
      });
    providerToken = providerUserRes.body.data.accessToken;
    providerUserId = providerUserRes.body.data.user.id;

    // 4. Onboard Problem Solver
    const onboardRes = await request(app)
      .post('/api/v1/providers/onboard')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        providerType: 'INDIVIDUAL',
        businessName: 'Kavitha Plumbing Works',
        professionalTitle: 'Master Plumber',
        bio: 'Expert in leak fixing and pipeline installations.',
        experienceYears: 8.0,
        serviceMode: 'HOME_VISIT',
        serviceRadiusKm: 15.0,
        availability: 'AVAILABLE',
        latitude: 12.9716,
        longitude: 77.5946,
        addressLine: '12th Cross, Indiranagar',
        area: 'Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        services: [
          {
            serviceId: plumbingServiceId,
            pricingUnit: 'PER_SERVICE',
            startingPrice: 350,
            typicalMin: 350,
            typicalMax: 800,
          },
        ],
      });
    providerProfileId = onboardRes.body.data.id;

    // 5. Register Third Party User for ABAC tests
    const otherRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `other_${ts}@civicsolve.org`,
        password: 'Password@123',
        fullName: 'Stranger User',
        phone: '9876543299',
        role: 'NEEDER',
      });
    otherUserToken = otherRes.body.data.accessToken;
  });

  let createdRequestId: string;

  it('Needer can create a service request with location and preferred schedule', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        providerId: providerProfileId,
        serviceId: plumbingServiceId,
        title: 'Emergency Kitchen Pipe Leak',
        description: 'Water is gushing from under the sink. Needs immediate repair.',
        serviceMode: 'HOME_VISIT',
        preferredSchedule: 'Within 2 hours',
        latitude: 12.9720,
        longitude: 77.5950,
        addressLine: 'Flat 302, Green Glen Layout',
        area: 'Bellandur',
        city: 'Bengaluru',
        pincode: '560103',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const reqData = res.body.data;
    expect(reqData.id).toBeDefined();
    expect(reqData.requestNumber).toMatch(/^CS-REQ-/);
    expect(reqData.status).toBe('PENDING');
    expect(reqData.neederId).toBe(neederId);
    expect(reqData.providerId).toBe(providerProfileId);
    expect(reqData.location).toBeDefined();
    expect(reqData.location.area).toBe('Bellandur');
    expect(reqData.statusHistory.length).toBe(1);
    expect(reqData.statusHistory[0].toStatus).toBe('PENDING');

    createdRequestId = reqData.id;
  });

  it('ABAC guard: Third party cannot view the service request', async () => {
    const res = await request(app)
      .get(`/api/v1/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('permission');
  });

  it('Assigned provider can view the service request in their inbox', async () => {
    const res = await request(app)
      .get(`/api/v1/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdRequestId);
    expect(res.body.data.neederName).toBe('Arjun Needer');
  });

  it('Assigned provider can accept request (PENDING -> ACCEPTED)', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ note: 'I can reach in 30 minutes.' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  it('Race condition prevention: Second accept fails with 409 Conflict', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ note: 'Accepting again' });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('Invalid transition');
  });

  it('Provider marks work started (ACCEPTED -> IN_PROGRESS)', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/start`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ note: 'Arrived at site and inspected the pipe.' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('Provider marks work completed (IN_PROGRESS -> COMPLETED) with final price', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/complete`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        finalPrice: 400,
        note: 'Replaced cracked brass valve and tested water flow.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.finalPrice).toBe(400);

    // Verify timeline history has all 4 steps recorded
    const detail = await request(app)
      .get(`/api/v1/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${neederToken}`);

    expect(detail.body.data.statusHistory.length).toBe(4);
  });

  it('Cannot cancel completed request (returns 409 Conflict)', async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${createdRequestId}/cancel`)
      .set('Authorization', `Bearer ${neederToken}`)
      .send({ reason: 'Changed my mind' });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('Cannot cancel request in COMPLETED state');
  });

  it('Needer can cancel a newly created PENDING request', async () => {
    // Create second request
    const createRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        providerId: providerProfileId,
        serviceId: plumbingServiceId,
        title: 'Tap washbasin fitting',
        description: 'Need new tap installed',
        serviceMode: 'HOME_VISIT',
        latitude: 12.9720,
        longitude: 77.5950,
        addressLine: 'Flat 302, Green Glen Layout',
        area: 'Bellandur',
        city: 'Bengaluru',
      });

    const secondReqId = createRes.body.data.id;

    const cancelRes = await request(app)
      .patch(`/api/v1/requests/${secondReqId}/cancel`)
      .set('Authorization', `Bearer ${neederToken}`)
      .send({ reason: 'Issue resolved by building maintenance staff.' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');
  });
});
