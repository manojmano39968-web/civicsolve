import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Star,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ServiceRequest, RequestStatus } from '@civicsolve/shared';

export const RequestsPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ALL');

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Review modal trigger (Milestone 8)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [problemSolved, setProblemSolved] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests', {
        params: filter !== 'ALL' ? { status: filter } : {},
      });
      if (res.data.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setRequests(list);
        if (selectedRequest) {
          // Refresh selected if still in list
          const updated = list.find((r: ServiceRequest) => r.id === selectedRequest.id);
          if (updated) {
            // fetch detailed request with timeline
            const detailRes = await api.get(`/requests/${selectedRequest.id}`);
            if (detailRes.data.success) setSelectedRequest(detailRes.data.data);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, filter]);

  const handleSelectRequest = async (req: ServiceRequest) => {
    try {
      const detailRes = await api.get(`/requests/${req.id}`);
      if (detailRes.data.success) {
        setSelectedRequest(detailRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch request detail:', err);
      setSelectedRequest(req);
    }
  };

  const handleConfirmCompleted = async (reqId: string) => {
    try {
      await api.patch(`/requests/${reqId}/complete`, {
        note: 'Confirmed problem solved by needer',
      });
      fetchRequests();
      if (selectedRequest?.id === reqId) {
        handleSelectRequest(selectedRequest);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to complete request.');
    }
  };

  const handleCancelRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsCancelling(true);
    try {
      await api.patch(`/requests/${selectedRequest.id}/cancel`, {
        reason: cancelReason,
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      fetchRequests();
      handleSelectRequest(selectedRequest);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to cancel request.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmittingReview(true);
    try {
      await api.post(`/requests/${selectedRequest.id}/reviews`, {
        rating,
        problemSolved,
        comment,
      });
      setIsReviewModalOpen(false);
      setComment('');
      fetchRequests();
      handleSelectRequest(selectedRequest);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="neutral">Pending Acceptance</Badge>;
      case 'ACCEPTED':
        return <Badge variant="accent">Accepted • In Transit</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="brand">In Progress</Badge>;
      case 'COMPLETED':
      case 'REVIEWED':
        return <Badge variant="success">Solved & Completed</Badge>;
      case 'CANCELLED':
      case 'REJECTED':
        return <Badge variant="danger">{status}</Badge>;
      case 'DISPUTED':
        return <Badge variant="warning">Under Dispute</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to view your requests</h2>
        <p className="text-xs text-slate-500 mb-6">
          Track problem solving progress, timelines, and verified resolutions.
        </p>
        <Button variant="primary" size="md" onClick={() => openAuthModal('login')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Service Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Follow your problems from need to verified resolution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold text-slate-600 shadow-2xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === 'ALL' ? 'bg-brand-primary text-white shadow-2xs' : 'hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === 'ACTIVE' ? 'bg-brand-primary text-white shadow-2xs' : 'hover:bg-slate-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('HISTORY')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === 'HISTORY' ? 'bg-brand-primary text-white shadow-2xs' : 'hover:bg-slate-50'
                }`}
              >
                History
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRequests}
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : 'text-slate-500'}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Requests List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            {isLoading && requests.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Loading your requests...</div>
            )}

            {!isLoading && requests.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-sm font-semibold text-slate-700 mb-1">No requests found</p>
                <p className="text-xs text-slate-400">
                  When you request help from a verified problem solver, it will appear here.
                </p>
              </div>
            )}

            {requests.map((req) => (
              <button
                key={req.id}
                onClick={() => handleSelectRequest(req)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedRequest?.id === req.id
                    ? 'bg-white border-brand-primary shadow-md ring-2 ring-brand-primary/10'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {req.requestNumber}
                  </span>
                  {getStatusBadge(req.status)}
                </div>

                <div className="font-bold text-sm text-slate-900 mb-1 truncate">
                  {req.title}
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                  <span>Solver: <strong className="text-slate-700">{req.providerName}</strong></span>
                  <span>•</span>
                  <span>{req.serviceName}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center text-brand-primary font-semibold">
                    View Timeline <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Request Detail & Timeline (Right Column) */}
          <div className="lg:col-span-7">
            {selectedRequest ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg border border-brand-primary/10">
                      {selectedRequest.requestNumber}
                    </span>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {selectedRequest.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Problem Solver Strip */}
                <div className="flex items-center justify-between bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Assigned Problem Solver</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {selectedRequest.providerName}
                    </div>
                    <div className="text-slate-500">{selectedRequest.providerTitle}</div>
                  </div>
                  {selectedRequest.status === 'ACCEPTED' || selectedRequest.status === 'IN_PROGRESS' ? (
                    <div className="text-right">
                      <div className="text-slate-400 font-medium">Direct Contact</div>
                      <div className="text-sm font-bold text-brand-primary">
                        {selectedRequest.neederPhone || 'Phone shared'}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Interactive Lifecycle Timeline */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Lifecycle Timeline & Verified Resolution
                  </h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                    {selectedRequest.statusHistory?.map((h, idx) => (
                      <div key={idx} className="relative flex items-start gap-3.5 pl-1">
                        <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 z-10 shadow-sm text-[11px] font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-bold text-slate-800">
                              Transition to: {h.toStatus}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {h.note && (
                            <p className="text-xs text-slate-600 mt-0.5">"{h.note}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                {selectedRequest.finalPrice && (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-800">Final Resolved Price</div>
                      <div className="text-xs text-emerald-600">Settled directly with solver</div>
                    </div>
                    <div className="text-xl font-extrabold text-emerald-950">
                      ₹{selectedRequest.finalPrice}
                    </div>
                  </div>
                )}

                {/* Needer Actions Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  {(selectedRequest.status === 'PENDING' || selectedRequest.status === 'ACCEPTED') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      Cancel Request
                    </Button>
                  )}

                  {selectedRequest.status === 'IN_PROGRESS' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConfirmCompleted(selectedRequest.id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      className="shadow-sm font-semibold"
                    >
                      Confirm Problem Solved
                    </Button>
                  )}

                  {selectedRequest.status === 'COMPLETED' && !selectedRequest.isReviewed && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsReviewModalOpen(true)}
                      leftIcon={<Star className="w-4 h-4 text-amber-300 fill-amber-300" />}
                      className="shadow-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none"
                    >
                      Write Verified Review
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
                Select a service request from the list to inspect its lifecycle timeline.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Reason Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Service Request"
      >
        <form onSubmit={handleCancelRequest} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please let the problem solver know why you need to cancel this request:
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="e.g. Issue resolved on own / Changed schedule / No longer required"
            className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-brand-accent focus:outline-none"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCancelling}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Modal (Milestone 8 preview integration) */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Problem Solver"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800">Was your problem completely solved?</div>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="problemSolved"
                  checked={problemSolved === true}
                  onChange={() => setProblemSolved(true)}
                  className="accent-brand-primary"
                />
                <span>Yes, fully solved</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="problemSolved"
                  checked={problemSolved === false}
                  onChange={() => setProblemSolved(false)}
                  className="accent-brand-primary"
                />
                <span>No, partially or not resolved</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comments & Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How was the punctuality, communication, and quality of work?"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-brand-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
