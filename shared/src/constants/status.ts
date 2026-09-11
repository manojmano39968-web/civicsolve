import { RequestStatus } from '../types/request.js';
import { PricingUnit } from '../types/provider.js';

export const REQUEST_STATUSES: Record<RequestStatus, RequestStatus> = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REVIEWED: 'REVIEWED'
};

export const PRICING_UNITS: Record<PricingUnit, { label: string; suffix: string }> = {
  PER_SERVICE: { label: 'Per Service', suffix: '/ service' },
  PER_HOUR: { label: 'Per Hour', suffix: '/ hr' },
  PER_DAY: { label: 'Per Day', suffix: '/ day' },
  PER_SQFT: { label: 'Per Sq.Ft', suffix: '/ sq.ft' },
  PER_ITEM: { label: 'Per Item', suffix: '/ item' },
  PER_KM: { label: 'Per Km', suffix: '/ km' },
  CUSTOM: { label: 'Custom Quote', suffix: '(custom)' }
};
