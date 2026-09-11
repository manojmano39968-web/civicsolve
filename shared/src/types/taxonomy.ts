import { PricingUnit } from './provider.js';

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  serviceCount?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  slug: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  defaultPricingUnit: PricingUnit;
  isActive: boolean;
  aliases?: string[];
}

export interface ServiceAlias {
  id: string;
  serviceId: string;
  alias: string;
  weight: number;
}
