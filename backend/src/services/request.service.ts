import crypto from 'crypto';
import { getDatabase } from '../database/index.js';
import {
  RequestStatus,
  ServiceRequest,
  RequestLocation,
  RequestStatusHistory,
  CreateRequestPayload,
} from '@civicsolve/shared';

export class RequestService {
  /**
   * Create a new service request from a solution needer to a problem solver
   */
  static async createRequest(
    neederId: string,
    payload: CreateRequestPayload
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    // 1. Verify provider exists
    const provider = await db.queryOne<{ id: string; user_id: string; business_name?: string }>(
      'SELECT id, user_id, business_name FROM provider_profiles WHERE id = ?',
      [payload.providerId]
    );
    if (!provider) {
      const err = new Error('Selected problem solver does not exist.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Needer cannot request service from themselves
    if (provider.user_id === neederId) {
      const err = new Error('You cannot request service from your own provider profile.');
      (err as any).statusCode = 400;
      throw err;
    }

    // 2. Verify service exists
    const service = await db.queryOne<{ id: string; name: string }>(
      'SELECT id, name FROM services WHERE id = ?',
      [payload.serviceId]
    );
    if (!service) {
      const err = new Error('Requested service does not exist.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 3. Generate human-readable request number: CS-REQ-XXXX-YYY
    const reqRandom = Math.floor(100 + Math.random() * 900);
    const reqTime = Date.now().toString().slice(-4);
    const requestNumber = `CS-REQ-${reqTime}-${reqRandom}`;

    const requestId = `req-${crypto.randomUUID()}`;
    const locationId = `loc-${crypto.randomUUID()}`;
    const historyId = `hist-${crypto.randomUUID()}`;

    // Execute in transaction
    await db.transaction(async () => {
      // Insert request
      await db.run(
        `INSERT INTO service_requests (
          id, request_number, needer_id, provider_id, service_id,
          title, description, service_mode, preferred_schedule, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
        [
          requestId,
          requestNumber,
          neederId,
          payload.providerId,
          payload.serviceId,
          payload.title,
          payload.description,
          payload.serviceMode,
          payload.preferredSchedule || null,
        ]
      );

      // Insert location
      await db.run(
        `INSERT INTO request_locations (
          id, request_id, latitude, longitude, address_line, area, city, pincode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          locationId,
          requestId,
          payload.latitude,
          payload.longitude,
          payload.addressLine,
          payload.area,
          payload.city,
          payload.pincode || null,
        ]
      );

      // Insert initial history event
      await db.run(
        `INSERT INTO request_status_history (
          id, request_id, from_status, to_status, note, changed_by_user_id
        ) VALUES (?, ?, NULL, 'PENDING', 'Request created by needer', ?)`,
        [historyId, requestId, neederId]
      );
    });

    return (await this.getRequestById(requestId, neederId, 'SOLUTION_NEEDER'))!;
  }

  /**
   * Get request details with ABAC security checks
   */
  static async getRequestById(
    requestId: string,
    userId: string,
    userRole: string
  ): Promise<ServiceRequest | null> {
    const db = getDatabase();

    const row = await db.queryOne<{
      id: string;
      request_number: string;
      needer_id: string;
      needer_name: string;
      needer_phone?: string;
      provider_id: string;
      provider_user_id: string;
      provider_name: string;
      provider_title: string;
      service_id: string;
      service_name: string;
      title: string;
      description: string;
      service_mode: string;
      preferred_schedule?: string;
      status: RequestStatus;
      estimated_price?: number;
      final_price?: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT 
        sr.*,
        u_needer.full_name as needer_name,
        u_needer.phone as needer_phone,
        pp.user_id as provider_user_id,
        u_prov.full_name as provider_name,
        pp.professional_title as provider_title,
        s.name as service_name
      FROM service_requests sr
      JOIN users u_needer ON sr.needer_id = u_needer.id
      JOIN provider_profiles pp ON sr.provider_id = pp.id
      JOIN users u_prov ON pp.user_id = u_prov.id
      JOIN services s ON sr.service_id = s.id
      WHERE sr.id = ?`,
      [requestId]
    );

    if (!row) return null;

    // ABAC Authorization: Only needer, assigned provider, or admin can view
    const isNeeder = row.needer_id === userId;
    const isProvider = row.provider_user_id === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isNeeder && !isProvider && !isAdmin) {
      const err = new Error('You do not have permission to view this service request.');
      (err as any).statusCode = 403;
      throw err;
    }

    // Fetch location
    const locRow = await db.queryOne<{
      id: string;
      request_id: string;
      latitude: number;
      longitude: number;
      address_line: string;
      area: string;
      city: string;
      pincode?: string;
    }>(
      'SELECT * FROM request_locations WHERE request_id = ?',
      [requestId]
    );

    const location: RequestLocation | null = locRow
      ? {
          id: locRow.id,
          requestId: locRow.request_id,
          latitude: locRow.latitude,
          longitude: locRow.longitude,
          addressLine: locRow.address_line,
          area: locRow.area,
          city: locRow.city,
          pincode: locRow.pincode || null,
        }
      : null;

    // Fetch status history
    const historyResult = await db.query<{
      id: string;
      request_id: string;
      from_status?: RequestStatus;
      to_status: RequestStatus;
      note?: string;
      changed_by_user_id: string;
      changed_by_name: string;
      created_at: string;
    }>(
      `SELECT rsh.*, u.full_name as changed_by_name
       FROM request_status_history rsh
       JOIN users u ON rsh.changed_by_user_id = u.id
       WHERE rsh.request_id = ?
       ORDER BY rsh.created_at ASC`,
      [requestId]
    );

    const statusHistory: RequestStatusHistory[] = historyResult.rows.map((h) => ({
      id: h.id,
      requestId: h.request_id,
      fromStatus: h.from_status || null,
      toStatus: h.to_status,
      note: h.note || null,
      changedByUserId: h.changed_by_user_id,
      changedByUserName: h.changed_by_name,
      createdAt: h.created_at,
    }));

    // Check if reviewed
    const reviewRow = await db.queryOne<{ id: string }>(
      'SELECT id FROM reviews WHERE request_id = ?',
      [requestId]
    );

    return {
      id: row.id,
      requestNumber: row.request_number,
      neederId: row.needer_id,
      neederName: row.needer_name,
      neederPhone: row.needer_phone || null,
      providerId: row.provider_id,
      providerName: row.provider_name,
      providerTitle: row.provider_title,
      serviceId: row.service_id,
      serviceName: row.service_name,
      title: row.title,
      description: row.description,
      serviceMode: row.service_mode as any,
      preferredSchedule: row.preferred_schedule || null,
      status: row.status,
      estimatedPrice: row.estimated_price || null,
      finalPrice: row.final_price || null,
      location,
      statusHistory,
      isReviewed: !!reviewRow,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * List requests for current user (either as needer or provider)
   */
  static async listRequests(
    userId: string,
    userRole: string,
    statusFilter?: string
  ): Promise<ServiceRequest[]> {
    const db = getDatabase();

    // Check if user has a provider profile
    const providerProfile = await db.queryOne<{ id: string }>(
      'SELECT id FROM provider_profiles WHERE user_id = ?',
      [userId]
    );

    let queryStr = `
      SELECT 
        sr.*,
        u_needer.full_name as needer_name,
        u_needer.phone as needer_phone,
        pp.user_id as provider_user_id,
        u_prov.full_name as provider_name,
        pp.professional_title as provider_title,
        s.name as service_name,
        rl.area, rl.city
      FROM service_requests sr
      JOIN users u_needer ON sr.needer_id = u_needer.id
      JOIN provider_profiles pp ON sr.provider_id = pp.id
      JOIN users u_prov ON pp.user_id = u_prov.id
      JOIN services s ON sr.service_id = s.id
      LEFT JOIN request_locations rl ON sr.id = rl.request_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (userRole === 'ADMIN') {
      // Admins see all
    } else if (providerProfile && userRole === 'PROVIDER') {
      // Provider view: requests sent to them
      conditions.push('sr.provider_id = ?');
      params.push(providerProfile.id);
    } else {
      // Needer view: requests created by them
      conditions.push('sr.needer_id = ?');
      params.push(userId);
    }

    if (statusFilter) {
      if (statusFilter === 'ACTIVE') {
        conditions.push("sr.status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS')");
      } else if (statusFilter === 'HISTORY') {
        conditions.push("sr.status IN ('COMPLETED', 'REJECTED', 'CANCELLED', 'REVIEWED')");
      } else {
        conditions.push('sr.status = ?');
        params.push(statusFilter);
      }
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY sr.created_at DESC';

    const result = await db.query<any>(queryStr, params);

    return result.rows.map((row) => ({
      id: row.id,
      requestNumber: row.request_number,
      neederId: row.needer_id,
      neederName: row.needer_name,
      neederPhone: row.needer_phone || null,
      providerId: row.provider_id,
      providerName: row.provider_name,
      providerTitle: row.provider_title,
      serviceId: row.service_id,
      serviceName: row.service_name,
      title: row.title,
      description: row.description,
      serviceMode: row.service_mode,
      preferredSchedule: row.preferred_schedule || null,
      status: row.status,
      estimatedPrice: row.estimated_price || null,
      finalPrice: row.final_price || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Provider accepts request: PENDING -> ACCEPTED
   */
  static async acceptRequest(
    requestId: string,
    providerUserId: string,
    note?: string
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    // Verify provider ownership
    const request = await this.getRequestById(requestId, providerUserId, 'PROVIDER');
    if (!request) {
      const err = new Error('Request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Atomic conditional status update
    const result = await db.run(
      `UPDATE service_requests 
       SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = 'PENDING'`,
      [requestId]
    );

    if (result.changes === 0) {
      const err = new Error(
        `Invalid transition: request is no longer in PENDING state (current status: ${request.status}).`
      );
      (err as any).statusCode = 409;
      throw err;
    }

    // Record transition history
    await db.run(
      `INSERT INTO request_status_history (
        id, request_id, from_status, to_status, note, changed_by_user_id
      ) VALUES (?, ?, 'PENDING', 'ACCEPTED', ?, ?)`,
      [`hist-${crypto.randomUUID()}`, requestId, note || 'Accepted by problem solver', providerUserId]
    );

    return (await this.getRequestById(requestId, providerUserId, 'PROVIDER'))!;
  }

  /**
   * Provider rejects request: PENDING -> REJECTED
   */
  static async rejectRequest(
    requestId: string,
    providerUserId: string,
    reason?: string
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    const request = await this.getRequestById(requestId, providerUserId, 'PROVIDER');
    if (!request) {
      const err = new Error('Request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const result = await db.run(
      `UPDATE service_requests 
       SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = 'PENDING'`,
      [requestId]
    );

    if (result.changes === 0) {
      const err = new Error(
        `Invalid transition: cannot reject request with current status: ${request.status}.`
      );
      (err as any).statusCode = 409;
      throw err;
    }

    await db.run(
      `INSERT INTO request_status_history (
        id, request_id, from_status, to_status, note, changed_by_user_id
      ) VALUES (?, ?, 'PENDING', 'REJECTED', ?, ?)`,
      [`hist-${crypto.randomUUID()}`, requestId, reason || 'Declined by problem solver', providerUserId]
    );

    return (await this.getRequestById(requestId, providerUserId, 'PROVIDER'))!;
  }

  /**
   * Provider starts work: ACCEPTED -> IN_PROGRESS
   */
  static async startRequest(
    requestId: string,
    providerUserId: string,
    note?: string
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    const request = await this.getRequestById(requestId, providerUserId, 'PROVIDER');
    if (!request) {
      const err = new Error('Request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const result = await db.run(
      `UPDATE service_requests 
       SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = 'ACCEPTED'`,
      [requestId]
    );

    if (result.changes === 0) {
      const err = new Error(
        `Invalid transition: cannot start work on request in state: ${request.status}. Must be ACCEPTED.`
      );
      (err as any).statusCode = 409;
      throw err;
    }

    await db.run(
      `INSERT INTO request_status_history (
        id, request_id, from_status, to_status, note, changed_by_user_id
      ) VALUES (?, ?, 'ACCEPTED', 'IN_PROGRESS', ?, ?)`,
      [`hist-${crypto.randomUUID()}`, requestId, note || 'Work in progress', providerUserId]
    );

    return (await this.getRequestById(requestId, providerUserId, 'PROVIDER'))!;
  }

  /**
   * Complete work: IN_PROGRESS -> COMPLETED
   * Can be initiated by provider or confirmed by needer
   */
  static async completeRequest(
    requestId: string,
    userId: string,
    userRole: string,
    finalPrice?: number,
    note?: string
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    const request = await this.getRequestById(requestId, userId, userRole);
    if (!request) {
      const err = new Error('Request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const result = await db.run(
      `UPDATE service_requests 
       SET status = 'COMPLETED', final_price = COALESCE(?, final_price), updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = 'IN_PROGRESS'`,
      [finalPrice || null, requestId]
    );

    if (result.changes === 0) {
      const err = new Error(
        `Invalid transition: cannot complete request with status: ${request.status}. Must be IN_PROGRESS.`
      );
      (err as any).statusCode = 409;
      throw err;
    }

    // Increment provider's completed count
    await db.run(
      'UPDATE provider_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [request.providerId]
    );

    await db.run(
      `INSERT INTO request_status_history (
        id, request_id, from_status, to_status, note, changed_by_user_id
      ) VALUES (?, ?, 'IN_PROGRESS', 'COMPLETED', ?, ?)`,
      [`hist-${crypto.randomUUID()}`, requestId, note || 'Service marked as completed', userId]
    );

    return (await this.getRequestById(requestId, userId, userRole))!;
  }

  /**
   * Cancel request: PENDING or ACCEPTED -> CANCELLED
   */
  static async cancelRequest(
    requestId: string,
    userId: string,
    userRole: string,
    reason?: string
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    const request = await this.getRequestById(requestId, userId, userRole);
    if (!request) {
      const err = new Error('Request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const currentStatus = request.status;
    if (currentStatus !== 'PENDING' && currentStatus !== 'ACCEPTED') {
      const err = new Error(
        `Cannot cancel request in ${currentStatus} state. Work may already be in progress or completed.`
      );
      (err as any).statusCode = 409;
      throw err;
    }

    const result = await db.run(
      `UPDATE service_requests 
       SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status IN ('PENDING', 'ACCEPTED')`,
      [requestId]
    );

    if (result.changes === 0) {
      const err = new Error('Request state was modified concurrently.');
      (err as any).statusCode = 409;
      throw err;
    }

    await db.run(
      `INSERT INTO request_status_history (
        id, request_id, from_status, to_status, note, changed_by_user_id
      ) VALUES (?, ?, ?, 'CANCELLED', ?, ?)`,
      [`hist-${crypto.randomUUID()}`, requestId, currentStatus, reason || 'Cancelled', userId]
    );

    return (await this.getRequestById(requestId, userId, userRole))!;
  }

  /**
   * Dispute request: IN_PROGRESS or COMPLETED -> DISPUTED
   */
  static async disputeRequest(
    requestId: string,
    userId: string,
    userRole: string,
    reason: string
  ): Promise<ServiceRequest> {
    const db = getDatabase();

    const request = await this.getRequestById(requestId, userId, userRole);
    if (!request) {
      const err = new Error('Request not found.');
      (err as any).statusCode = 404;
      throw err;
    }

    const currentStatus = request.status;
    if (currentStatus !== 'IN_PROGRESS' && currentStatus !== 'COMPLETED') {
      const err = new Error(
        `Cannot dispute request in ${currentStatus} state. Disputable states: IN_PROGRESS, COMPLETED.`
      );
      (err as any).statusCode = 409;
      throw err;
    }

    const result = await db.run(
      `UPDATE service_requests 
       SET status = 'DISPUTED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND status IN ('IN_PROGRESS', 'COMPLETED')`,
      [requestId]
    );

    if (result.changes === 0) {
      const err = new Error('Concurrent modification error.');
      (err as any).statusCode = 409;
      throw err;
    }

    await db.run(
      `INSERT INTO request_status_history (
        id, request_id, from_status, to_status, note, changed_by_user_id
      ) VALUES (?, ?, ?, 'DISPUTED', ?, ?)`,
      [`hist-${crypto.randomUUID()}`, requestId, currentStatus, reason, userId]
    );

    return (await this.getRequestById(requestId, userId, userRole))!;
  }
}
