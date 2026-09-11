export interface Review {
  id: string;
  requestId: string;
  neederId: string;
  neederName?: string;
  providerId: string;
  problemSolved: boolean;
  rating: number; // 1 to 5
  comment?: string | null;
  createdAt: string;
}

export interface CreateReviewPayload {
  requestId: string;
  problemSolved: boolean;
  rating: number;
  comment?: string;
}
