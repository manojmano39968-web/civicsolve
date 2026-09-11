import { ServiceMode } from './provider.js';

export type RequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED' 
  | 'REVIEWED';

export interface RequestLocation {
  id: string;
  requestId: string;
  latitude: number;
  longitude: number;
  addressLine: string;
  area: string;
  city: string;
  pincode?: string | null;
}

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  fromStatus?: RequestStatus | null;
  toStatus: RequestStatus;
  note?: string | null;
  changedByUserId: string;
  changedByUserName?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  neederId: string;
  neederName?: string;
  neederPhone?: string | null;
  providerId: string;
  providerName?: string;
  providerTitle?: string;
  serviceId: string;
  serviceName?: string;
  title: string;
  description: string;
  serviceMode: ServiceMode;
  preferredSchedule?: string | null;
  status: RequestStatus;
  estimatedPrice?: number | null;
  finalPrice?: number | null;
  location?: RequestLocation | null;
  statusHistory?: RequestStatusHistory[];
  isReviewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestPayload {
  providerId: string;
  serviceId: string;
  title: string;
  description: string;
  serviceMode: ServiceMode;
  preferredSchedule?: string;
  addressLine: string;
  area: string;
  city: string;
  pincode?: string;
  latitude: number;
  longitude: number;
}
