import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { runSeeds } from '../src/database/seed.js';

describe('Provider Profiles, Onboarding & Location Privacy', () => {
  beforeAll(async () => {
    await runSeeds();
  });

  let providerToken: string;
  let neederToken: string;

  beforeAll(async () => {
    // Register test provider
    const provEmail = `testprov_${Date.now()}@civicsolve.org`;
    const provRes = await request(app).post('/api/v1/auth/register').send({
      email: provEmail,
      password: 'SecurePassword123!',
      fullName: 'Vikram Builder',
      role: 'PROVIDER',
    });
    providerToken = provRes.body.data.accessToken;

    // Register test needer
    const neederEmail = `testneeder_${Date.now()}@civicsolve.org`;
    const neederRes = await request(app).post('/api/v1/auth/register').send({
      email: neederEmail,
      password: 'SecurePassword123!',
      fullName: 'Anita Needer',
      role: 'NEEDER',
    });
    neederToken = neederRes.body.data.accessToken;
  });

  it('POST /api/v1/providers/onboard should complete provider onboarding with services and pricing', async () => {
    const onboardingPayload = {
      providerType: 'INDIVIDUAL' as const,
      professionalTitle: 'Experienced Residential Electrician',
      bio: 'Over 6 years fixing home electrical faults, switchboards, and wiring.',
      experienceYears: 6.0,
      serviceMode: 'HOME_VISIT' as const,
      serviceRadiusKm: 15.0,
      availability: 'AVAILABLE' as const,
      latitude: 12.9716,
      longitude: 77.5946,
      addressLine: 'Secret Flat 402, Private Residency, 12th Cross',
      area: 'Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      services: [
        {
          serviceId: 'svc-electrician',
          customTitle: 'Standard Home Electrical Visit',
          startingPrice: 200,
          typicalMin: 200,
          typicalMax: 600,
          pricingUnit: 'PER_SERVICE' as const,
          pricingNotes: 'Includes inspection and minor repairs.',
        },
      ],
    };

    const res = await request(app)
      .post('/api/v1/providers/onboard')
      .set('Authorization', `Bearer ${providerToken}`)
      .send(onboardingPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.professionalTitle).toBe(onboardingPayload.professionalTitle);
    expect(res.body.data.experienceYears).toBe(6.0);
    expect(res.body.data.services.length).toBe(1);
    expect(res.body.data.services[0].pricing.startingPrice).toBe(200);
  });

  it('POST /api/v1/providers/onboard should reject needer role with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/v1/providers/onboard')
      .set('Authorization', `Bearer ${neederToken}`)
      .send({
        providerType: 'INDIVIDUAL',
        professionalTitle: 'Should Fail',
        experienceYears: 2,
        serviceMode: 'HOME_VISIT',
        serviceRadiusKm: 5,
        availability: 'AVAILABLE',
        latitude: 12.97,
        longitude: 77.59,
        addressLine: 'Test',
        area: 'Indiranagar',
        city: 'Bengaluru',
        services: [{ serviceId: 'svc-electrician', pricingUnit: 'PER_SERVICE' }],
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET /api/v1/providers/:id should strictly shield individual residential address in public profile', async () => {
    // Get painter provider from seed
    const res = await request(app)
      .get('/api/v1/providers/prof-usr-prov-1')
      .query({ lat: 12.9352, lng: 77.6245 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const profile = res.body.data;

    // PRIVACY VERIFICATION:
    // Individual provider's exact street address must NEVER be public!
    expect(profile.providerType).toBe('INDIVIDUAL');
    expect(profile.publicAddress).toBeNull();
    // Area and city are public
    expect(profile.area).toBe('Indiranagar');
    expect(profile.city).toBe('Bengaluru');
    // Distance must be computed server-side
    expect(profile.calculatedDistanceKm).toBeDefined();
    expect(typeof profile.calculatedDistanceKm).toBe('number');
    expect(profile.calculatedDistanceKm).toBeGreaterThan(0);
  });

  it('PUT /api/v1/providers/me/availability should toggle availability status', async () => {
    const res = await request(app)
      .put('/api/v1/providers/me/availability')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        status: 'BUSY',
        statusNote: 'Currently working on an installation job.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify profile reflects busy status
    const meRes = await request(app)
      .get('/api/v1/providers/me/profile')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.availability).toBe('BUSY');
    expect(meRes.body.data.statusNote).toBe('Currently working on an installation job.');
  });

  it('GET /api/v1/providers/:id returns ratingAvg: null when provider has zero reviews', async () => {
    // Check the newly onboarded test provider (has 0 reviews)
    const meRes = await request(app)
      .get('/api/v1/providers/me/profile')
      .set('Authorization', `Bearer ${providerToken}`);

    const provId = meRes.body.data.id;
    const pubRes = await request(app).get(`/api/v1/providers/${provId}`);

    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.reviewCount).toBe(0);
    expect(pubRes.body.data.ratingAvg).toBeNull();
  });
});
