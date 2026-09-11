import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('Verified Reviews & Bayesian Reputation Engine (Milestone 8)', () => {
  let neederToken: string;
  let neederId: string;
  let otherUserToken: string;
  let providerToken: string;
  let providerProfileId: string;
  let serviceId: string;
  let completedRequestId: string;
  let pendingRequestId: string;

  beforeAll(async () => {
    await runSeeds();

    const ts = Date.now();

    // 1. Get service
    const taxRes = await request(app).get('/api/v1/taxonomy/services');
    serviceId = taxRes.body.data[0].id;

    // 2. Register needer
    const neederRes = await request(app).post('/api/v1/auth/register').send({
      email: `rev_needer_${ts}@civicsolve.org`,
      password: 'Password@123',
      fullName: 'Vikram Needer',
      role: 'NEEDER',
    });
    neederToken = neederRes.body.data.accessToken;
    neederId = neederRes.body.data.user.id;

    // 3. Register other user
    const otherRes = await request(app).post('/api/v1/auth/register').send({
      email: `rev_other_${ts}@civicsolve.org`,
      password: 'Password@123',
      fullName: 'Other Needer',
      role: 'NEEDER',
    });
    otherUserToken = otherRes.body.data.accessToken;

    // 4. Register provider & onboard
    const provUserRes = await request(app).post('/api/v1/auth/register').send({
      email: `rev_prov_${ts}@civicsolve.org`,
      password: 'Password@123',
      fullName: 'Ramesh Carpenter',
      role: 'PROVIDER',
    });
    providerToken = provUserRes.body.data.accessToken;

    const onboardRes = await request(app)
      .post('/api/v1/providers/onboard')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        providerType: 'INDIVIDUAL',
        businessName: 'Ramesh Carpentry',
        professionalTitle: 'Senior Carpenter',
        bio: 'Furniture making and fixing',
        experienceYears: 10,
        serviceMode: 'HOME_VISIT',
        serviceRadiusKm: 20,
        availability: 'AVAILABLE',
        latitude: 12.9716,
        longitude: 77.5946,
        addressLine: 'MG Road',
        area: 'Central',
        city: 'Bengaluru',
        services: [
          {
            serviceId,
            pricingUnit: 'PER_SERVICE',
            startingPrice: 500,
          },
        ],
      });
    providerProfileId = onboardRes.body.data.id;

    // 5. Create Request 1 and advance to COMPLETED
    const req1Res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        providerId: providerProfileId,
        serviceId,
        title: 'Fix wooden door latch',
        description: 'Door is not latching properly.',
        serviceMode: 'HOME_VISIT',
        latitude: 12.972,
        longitude: 77.595,
        addressLine: 'Flat 101, Residency',
        area: 'Central',
        city: 'Bengaluru',
      });
    completedRequestId = req1Res.body.data.id;

    // Accept -> Start -> Complete
    await request(app)
      .patch(`/api/v1/requests/${completedRequestId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ note: 'Accepted' });

    await request(app)
      .patch(`/api/v1/requests/${completedRequestId}/start`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ note: 'Started' });

    await request(app)
      .patch(`/api/v1/requests/${completedRequestId}/complete`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ finalPrice: 500, note: 'Done' });

    // 6. Create Request 2 (left in PENDING state)
    const req2Res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        providerId: providerProfileId,
        serviceId,
        title: 'Fix window hinge',
        description: 'Hinge is loose.',
        serviceMode: 'HOME_VISIT',
        latitude: 12.972,
        longitude: 77.595,
        addressLine: 'Flat 101, Residency',
        area: 'Central',
        city: 'Bengaluru',
      });
    pendingRequestId = req2Res.body.data.id;
  });

  it('Cannot review a request that is still PENDING', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${pendingRequestId}/reviews`)
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        rating: 5,
        problemSolved: true,
        comment: 'Great work',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Only COMPLETED requests can be reviewed');
  });

  it('ABAC Guard: Unauthorized user cannot review someone else request', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${completedRequestId}/reviews`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        rating: 5,
        problemSolved: true,
        comment: 'Imposter review',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('Only the solution needer');
  });

  it('Needer can submit a verified review on COMPLETED request', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${completedRequestId}/reviews`)
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        rating: 5,
        problemSolved: true,
        comment: 'Punctual, polite, and fixed the latch perfectly!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.problemSolved).toBe(true);
    expect(res.body.data.neederName).toBe('Vikram Needer');

    // Verify request transitioned to REVIEWED
    const reqDetail = await request(app)
      .get(`/api/v1/requests/${completedRequestId}`)
      .set('Authorization', `Bearer ${neederToken}`);

    expect(reqDetail.body.data.status).toBe('REVIEWED');
    expect(reqDetail.body.data.isReviewed).toBe(true);
  });

  it('Idempotency: Submitting a second review on the same request returns 409 Conflict', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${completedRequestId}/reviews`)
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        rating: 4,
        problemSolved: true,
        comment: 'Trying duplicate review',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('already been submitted');
  });

  it('Bayesian reputation recalculation adjusts provider profile rating with prior', async () => {
    const provRes = await request(app).get(`/api/v1/providers/${providerProfileId}`);

    expect(provRes.status).toBe(200);
    const profile = provRes.body.data;
    expect(profile.reviewCount).toBe(1);
    // With 1 review of 5.0 and prior m=3, C=4.0:
    // (1 * 5.0 + 3 * 4.0) / (1 + 3) = 17 / 4 = 4.25 -> rounded to 4.3
    expect(profile.ratingAvg).toBeCloseTo(4.3, 1);
  });

  it('Public Review Feed returns verified reviews for the provider', async () => {
    const res = await request(app).get(`/api/v1/providers/${providerProfileId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].rating).toBe(5);
    expect(res.body.data[0].comment).toContain('fixed the latch perfectly');
    expect(res.body.data[0].problemSolved).toBe(true);
  });
});
