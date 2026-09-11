import { getDatabase } from '../database/index.js';
import { calculateHaversineDistanceKm, getBoundingBox } from '../utils/geo.js';
import { SearchFilterParams } from '@civicsolve/shared';

export interface ProviderCandidate {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  providerType: string;
  businessName?: string | null;
  professionalTitle: string;
  bio?: string | null;
  experienceYears: number;
  serviceMode: string;
  serviceRadiusKm: number;
  isVerified: boolean;
  ratingAvg: number;
  reviewCount: number;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  isPublic: boolean;
  addressLine?: string | null;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  customTitle?: string | null;
  startingPrice?: number | null;
  typicalMin?: number | null;
  typicalMax?: number | null;
  pricingUnit: string;
  calculatedDistanceKm?: number;
}

export class CandidateFilter {
  private db = getDatabase();

  async findEligibleCandidates(
    serviceIds: string[],
    filters: SearchFilterParams
  ): Promise<ProviderCandidate[]> {
    const params: any[] = [];
    let sql = `
      SELECT p.*, u.full_name, u.avatar_url,
             l.latitude, l.longitude, l.address_line, l.area, l.city, l.pincode, l.is_public,
             a.status as avail_status,
             ps.service_id, s.name as service_name, c.name as category_name, ps.custom_title,
             pr.starting_price, pr.typical_min, pr.typical_max, pr.pricing_unit
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id AND u.is_active = 1 AND u.deleted_at IS NULL
      JOIN provider_locations l ON l.provider_id = p.id
      JOIN provider_availability a ON a.provider_id = p.id
      JOIN provider_services ps ON ps.provider_id = p.id AND ps.is_active = 1
      JOIN services s ON s.id = ps.service_id AND s.is_active = 1
      JOIN categories c ON c.id = s.category_id
      LEFT JOIN service_pricing pr ON pr.provider_service_id = ps.id
      WHERE p.deleted_at IS NULL
    `;

    // 1. Service filter
    if (serviceIds.length > 0) {
      const placeholders = serviceIds.map((_, i) => `$${params.length + i + 1}`).join(',');
      sql += ` AND ps.service_id IN (${placeholders})`;
      params.push(...serviceIds);
    }

    // 2. Availability filter (exclude OFFLINE by default unless requested)
    if (filters.onlyAvailable) {
      params.push('AVAILABLE');
      sql += ` AND a.status = $${params.length}`;
    } else {
      params.push('OFFLINE');
      sql += ` AND a.status != $${params.length}`;
    }

    // 3. Verification filter
    if (filters.onlyVerified) {
      sql += ` AND p.is_verified = 1`;
    }

    // 4. Service Mode filter
    if (filters.serviceMode && filters.serviceMode !== 'BOTH') {
      params.push(filters.serviceMode);
      params.push('BOTH');
      sql += ` AND (p.service_mode = $${params.length - 1} OR p.service_mode = $${params.length})`;
    }

    // 5. Spatial Bounding Box Filter (Indexed candidate pruning in SQL)
    if (filters.latitude !== undefined && filters.longitude !== undefined) {
      const maxSearchRadius = filters.maxDistanceKm || 50;
      const box = getBoundingBox(filters.latitude, filters.longitude, maxSearchRadius);

      params.push(box.minLat, box.maxLat, box.minLon, box.maxLon);
      const latMinIdx = params.length - 3;
      const latMaxIdx = params.length - 2;
      const lonMinIdx = params.length - 1;
      const lonMaxIdx = params.length;

      sql += ` AND l.latitude BETWEEN $${latMinIdx} AND $${latMaxIdx}
               AND l.longitude BETWEEN $${lonMinIdx} AND $${lonMaxIdx}`;
    }

    const result = await this.db.query(sql, params);

    // Map rows and apply Hard Radius Filter
    const eligible: ProviderCandidate[] = [];

    for (const row of result.rows) {
      let dist: number | undefined;

      if (filters.latitude !== undefined && filters.longitude !== undefined) {
        dist = calculateHaversineDistanceKm(
          filters.latitude,
          filters.longitude,
          row.latitude,
          row.longitude
        );

        // HARD ELIGIBILITY CHECK:
        // Provider must be within their own declared service radius!
        if (dist > row.service_radius_km) {
          continue; // Strictly excluded
        }

        // Check user max distance filter if specified
        if (filters.maxDistanceKm && dist > filters.maxDistanceKm) {
          continue;
        }
      }

      eligible.push({
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        providerType: row.provider_type,
        businessName: row.business_name,
        professionalTitle: row.professional_title,
        bio: row.bio,
        experienceYears: row.experience_years,
        serviceMode: row.service_mode,
        serviceRadiusKm: row.service_radius_km,
        isVerified: Boolean(row.is_verified),
        ratingAvg: row.rating_avg,
        reviewCount: row.review_count,
        availability: row.avail_status,
        area: row.area,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
        isPublic: Boolean(row.is_public),
        addressLine: row.address_line,
        serviceId: row.service_id,
        serviceName: row.service_name,
        categoryName: row.category_name,
        customTitle: row.custom_title,
        startingPrice: row.starting_price,
        typicalMin: row.typical_min,
        typicalMax: row.typical_max,
        pricingUnit: row.pricing_unit || 'PER_SERVICE',
        calculatedDistanceKm: dist,
      });
    }

    return eligible;
  }
}
