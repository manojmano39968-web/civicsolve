import { ProviderRepository } from '../repositories/provider.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ProviderOnboardingInput, UpdateAvailabilityInput } from '../validators/provider.validator.js';
import { ProviderProfile, ProviderPublicSummary } from '@civicsolve/shared';
import { calculateHaversineDistanceKm } from '../utils/geo.js';

export class ProviderService {
  private providerRepo = new ProviderRepository();
  private userRepo = new UserRepository();

  async onboard(userId: string, input: ProviderOnboardingInput): Promise<ProviderProfile> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.role !== 'PROVIDER') {
      const err: any = new Error('Only registered service providers can complete provider onboarding.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return this.providerRepo.saveOnboarding(userId, input);
  }

  async getMyProfile(userId: string): Promise<ProviderProfile | null> {
    return this.providerRepo.findByUserId(userId);
  }

  async getPublicProfile(providerId: string, neederLat?: number, neederLng?: number): Promise<ProviderPublicSummary | null> {
    const profile = await this.providerRepo.findById(providerId);
    if (!profile) return null;

    const user = await this.userRepo.findById(profile.userId);
    if (!user) return null;

    let calculatedDistance: number | undefined;
    if (neederLat !== undefined && neederLng !== undefined && profile.location) {
      calculatedDistance = calculateHaversineDistanceKm(
        neederLat,
        neederLng,
        profile.location.latitude,
        profile.location.longitude
      );
    }

    // Strict Privacy Serialization:
    // For individual/student/freelancer, residential address line is strictly shielded!
    const isCommercialBusiness = profile.providerType === 'BUSINESS' && profile.location?.isPublic;
    const publicAddress = isCommercialBusiness ? profile.location?.addressLine : null;

    return {
      id: profile.id,
      userId: profile.userId,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      providerType: profile.providerType,
      businessName: profile.businessName,
      professionalTitle: profile.professionalTitle,
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      serviceMode: profile.serviceMode,
      serviceRadiusKm: profile.serviceRadiusKm,
      isVerified: profile.isVerified,
      ratingAvg: profile.ratingAvg,
      reviewCount: profile.reviewCount,
      availability: profile.availability,
      area: profile.location?.area || 'Local Area',
      city: profile.location?.city || 'City',
      calculatedDistanceKm: calculatedDistance,
      publicAddress,
      services: (profile.services || []).map(s => ({
        serviceId: s.serviceId,
        name: s.serviceName,
        startingPrice: s.pricing?.startingPrice,
        typicalMin: s.pricing?.typicalMin,
        typicalMax: s.pricing?.typicalMax,
        pricingUnit: s.pricing?.pricingUnit || 'PER_SERVICE',
      })),
    };
  }

  async updateAvailability(userId: string, input: UpdateAvailabilityInput): Promise<void> {
    const profile = await this.providerRepo.findByUserId(userId);
    if (!profile) {
      const err: any = new Error('Provider profile not found.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    await this.providerRepo.updateAvailability(profile.id, input.status, input.statusNote);
  }
}
