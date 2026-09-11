import { getDatabase } from '../database/index.js';
import { ProviderProfile, ProviderLocation, ProviderServiceOffered } from '@civicsolve/shared';
import { ProviderOnboardingInput } from '../validators/provider.validator.js';

export class ProviderRepository {
  private db = getDatabase();

  async findByUserId(userId: string): Promise<ProviderProfile | null> {
    const sql = `
      SELECT p.*, u.full_name, u.email, u.phone, u.avatar_url,
             l.id as loc_id, l.latitude, l.longitude, l.address_line, l.area, l.city, l.pincode, l.is_public,
             a.status as avail_status, a.status_note as avail_note
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN provider_locations l ON l.provider_id = p.id
      LEFT JOIN provider_availability a ON a.provider_id = p.id
      WHERE p.user_id = $1 AND p.deleted_at IS NULL
    `;
    const result = await this.db.query(sql, [userId]);
    if (result.rows.length === 0) return null;
    return this.mapRowToProfile(result.rows[0]);
  }

  async findById(providerId: string): Promise<ProviderProfile | null> {
    const sql = `
      SELECT p.*, u.full_name, u.email, u.phone, u.avatar_url,
             l.id as loc_id, l.latitude, l.longitude, l.address_line, l.area, l.city, l.pincode, l.is_public,
             a.status as avail_status, a.status_note as avail_note
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN provider_locations l ON l.provider_id = p.id
      LEFT JOIN provider_availability a ON a.provider_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `;
    const result = await this.db.query(sql, [providerId]);
    if (result.rows.length === 0) return null;
    return this.mapRowToProfile(result.rows[0]);
  }

  async getOfferedServices(providerId: string): Promise<ProviderServiceOffered[]> {
    const sql = `
      SELECT ps.*, s.name as service_name, c.name as category_name,
             pr.id as pricing_id, pr.starting_price, pr.typical_min, pr.typical_max, pr.pricing_unit, pr.pricing_notes
      FROM provider_services ps
      JOIN services s ON s.id = ps.service_id
      JOIN categories c ON c.id = s.category_id
      LEFT JOIN service_pricing pr ON pr.provider_service_id = ps.id
      WHERE ps.provider_id = $1 AND ps.is_active = 1
    `;
    const result = await this.db.query(sql, [providerId]);
    return result.rows.map(row => ({
      id: row.id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      serviceName: row.service_name,
      categoryName: row.category_name,
      customTitle: row.custom_title,
      customDescription: row.custom_description,
      isActive: Boolean(row.is_active),
      pricing: row.pricing_id ? {
        id: row.pricing_id,
        providerServiceId: row.id,
        startingPrice: row.starting_price,
        typicalMin: row.typical_min,
        typicalMax: row.typical_max,
        pricingUnit: row.pricing_unit,
        pricingNotes: row.pricing_notes,
      } : null,
    }));
  }

  async saveOnboarding(userId: string, input: ProviderOnboardingInput): Promise<ProviderProfile> {
    return this.db.transaction(async (tx) => {
      // 1. Fetch or create provider profile
      let profileRes = await tx.query('SELECT id FROM provider_profiles WHERE user_id = $1', [userId]);
      let profileId: string;

      if (profileRes.rows.length === 0) {
        profileId = `prof-${userId}`;
        await tx.query(
          `INSERT INTO provider_profiles (
             id, user_id, provider_type, business_name, professional_title, bio,
             experience_years, service_mode, service_radius_km
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            profileId,
            userId,
            input.providerType,
            input.businessName || null,
            input.professionalTitle,
            input.bio || null,
            input.experienceYears,
            input.serviceMode,
            input.serviceRadiusKm,
          ]
        );
      } else {
        profileId = profileRes.rows[0].id;
        await tx.query(
          `UPDATE provider_profiles SET
             provider_type = $1, business_name = $2, professional_title = $3,
             bio = $4, experience_years = $5, service_mode = $6, service_radius_km = $7,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $8`,
          [
            input.providerType,
            input.businessName || null,
            input.professionalTitle,
            input.bio || null,
            input.experienceYears,
            input.serviceMode,
            input.serviceRadiusKm,
            profileId,
          ]
        );
      }

      // 2. Upsert Location
      const isPublic = input.providerType === 'BUSINESS' ? 1 : 0;
      await tx.query(
        `INSERT INTO provider_locations (id, provider_id, latitude, longitude, address_line, area, city, pincode, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (provider_id) DO UPDATE SET
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           address_line = EXCLUDED.address_line,
           area = EXCLUDED.area,
           city = EXCLUDED.city,
           pincode = EXCLUDED.pincode,
           is_public = EXCLUDED.is_public`,
        [
          `loc-${profileId}`,
          profileId,
          input.latitude,
          input.longitude,
          input.addressLine,
          input.area,
          input.city,
          input.pincode || null,
          isPublic,
        ]
      );

      // 3. Upsert Availability
      await tx.query(
        `INSERT INTO provider_availability (id, provider_id, status, status_note, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (provider_id) DO UPDATE SET
           status = EXCLUDED.status,
           status_note = EXCLUDED.status_note,
           updated_at = CURRENT_TIMESTAMP`,
        [`avail-${profileId}`, profileId, input.availability, input.statusNote || null]
      );

      // 4. Save Offered Services & Pricing
      // Clear existing offered services for clean update
      await tx.query('DELETE FROM provider_services WHERE provider_id = $1', [profileId]);

      for (const s of input.services) {
        const psId = `ps-${profileId}-${s.serviceId}`;
        await tx.query(
          `INSERT INTO provider_services (id, provider_id, service_id, custom_title, custom_description, is_active)
           VALUES ($1, $2, $3, $4, $5, 1)`,
          [psId, profileId, s.serviceId, s.customTitle || null, s.customDescription || null]
        );

        await tx.query(
          `INSERT INTO service_pricing (id, provider_service_id, starting_price, typical_min, typical_max, pricing_unit, pricing_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            `prc-${psId}`,
            psId,
            s.startingPrice ?? null,
            s.typicalMin ?? null,
            s.typicalMax ?? null,
            s.pricingUnit,
            s.pricingNotes || null,
          ]
        );
      }

      const updated = await this.findById(profileId);
      if (!updated) throw new Error('Failed to retrieve updated profile');
      return updated;
    });
  }

  async updateAvailability(providerId: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE', note?: string): Promise<void> {
    await this.db.query(
      `INSERT INTO provider_availability (id, provider_id, status, status_note, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (provider_id) DO UPDATE SET
         status = EXCLUDED.status,
         status_note = EXCLUDED.status_note,
         updated_at = CURRENT_TIMESTAMP`,
      [`avail-${providerId}`, providerId, status, note || null]
    );
  }

  private async mapRowToProfile(row: any): Promise<ProviderProfile> {
    const services = await this.getOfferedServices(row.id);
    const location: ProviderLocation | null = row.loc_id ? {
      id: row.loc_id,
      providerId: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      addressLine: row.address_line,
      area: row.area,
      city: row.city,
      pincode: row.pincode,
      isPublic: Boolean(row.is_public),
    } : null;

    return {
      id: row.id,
      userId: row.user_id,
      providerType: row.provider_type,
      businessName: row.business_name,
      professionalTitle: row.professional_title,
      bio: row.bio,
      experienceYears: row.experience_years,
      serviceMode: row.service_mode,
      serviceRadiusKm: row.service_radius_km,
      isVerified: Boolean(row.is_verified),
      verificationBadge: row.verification_badge,
      ratingAvg: row.rating_avg,
      reviewCount: row.review_count,
      availability: row.avail_status || 'AVAILABLE',
      statusNote: row.avail_note,
      location,
      services,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
