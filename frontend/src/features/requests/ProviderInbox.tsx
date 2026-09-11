import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Check,
  Play,
  CheckCircle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { ServiceRequest } from '@civicsolve/shared';

export const ProviderInbox: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'HISTORY'>('PENDING');

  // Accept Modal
  const [acceptingReq, setAcceptingReq] = useState<ServiceRequest | null>(null);
  const [acceptNote, setAcceptNote] = useState('I am on my way and will arrive shortly.');
  const [isAccepting, setIsAccepting] = useState(false);

  // Reject Modal
  const [rejectingReq, setRejectingReq] = useState<ServiceRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Currently occupied with another assignment.');
  const [isRejecting, setIsRejecting] = useState(false);

  // Complete Modal
  const [completingReq, setCompletingReq] = useState<ServiceRequest | null>(null);
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [completeNote, setCompleteNote] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/requests', {
        params: { status: activeTab },
      });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load provider requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingReq) return;
    setIsAccepting(true);
    try {
      await api.patch(`/requests/${acceptingReq.id}/accept`, {
        note: acceptNote,
      });
      setAcceptingReq(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to accept request.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    setIsRejecting(true);
    try {
      await api.patch(`/requests/${rejectingReq.id}/reject`, {
        reason: rejectReason,
      });
      setRejectingReq(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reject request.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleStartWork = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}/start`, {
        note: 'Service provider arrived and began troubleshooting.',
      });
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update work status.');
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingReq) return;
    setIsCompleting(true);
    try {
      await api.patch(`/requests/${completingReq.id}/complete`, {
        finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
        note: completeNote || 'Problem solved successfully.',
      });
      setCompletingReq(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to mark as completed.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            New Requests
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active Work
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRequests}
          title="Refresh incoming requests"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : 'text-slate-400'}`} />
        </Button>
      </div>

      {/* Requests List */}
      {isLoading && requests.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
      )}

      {!isLoading && requests.length === 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">No {activeTab.toLowerCase()} requests</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming customer requests will appear here in real time.
          </p>
        </div>
      )}

      <div className="space-y-3.5">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded">
                  {req.requestNumber}
                </span>
                <Badge variant={req.status === 'PENDING' ? 'neutral' : req.status === 'ACCEPTED' ? 'accent' : 'brand'}>
                  {req.status}
                </Badge>
              </div>
              <div className="text-[11px] text-slate-400">
                Received: {new Date(req.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <h4 className="text-base font-bold text-slate-900">{req.title}</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                "{req.description}"
              </p>
            </div>

            {/* Customer & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
              <div>
                <div className="text-slate-400 font-medium">Customer</div>
                <div className="font-bold text-slate-800 mt-0.5">{req.neederName}</div>
                {req.neederPhone && (
                  <div className="flex items-center gap-1 text-slate-600 mt-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{req.neederPhone}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-slate-400 font-medium">Preferred Time & Mode</div>
                <div className="font-semibold text-slate-700 mt-0.5">
                  {req.preferredSchedule || 'Immediate'} • {req.serviceMode}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {req.status === 'PENDING' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRejectingReq(req)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setAcceptingReq(req)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    className="shadow-sm font-semibold"
                  >
                    Accept Request
                  </Button>
                </>
              )}

              {req.status === 'ACCEPTED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartWork(req.id)}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  className="shadow-sm font-semibold"
                >
                  Start Work (Arrived)
                </Button>
              )}

              {req.status === 'IN_PROGRESS' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCompletingReq(req);
                    setFinalPrice(req.estimatedPrice ? req.estimatedPrice.toString() : '');
                  }}
                  leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                  className="shadow-sm font-semibold bg-emerald-600 hover:bg-emerald-700 border-none"
                >
                  Mark Solved & Completed
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Accept Modal */}
      <Modal
        isOpen={!!acceptingReq}
        onClose={() => setAcceptingReq(null)}
        title="Accept Customer Request"
      >
        <form onSubmit={handleAccept} className="space-y-4">
          <p className="text-xs text-slate-600">
            Send an arrival note or ETA to the customer:
          </p>
          <textarea
            value={acceptNote}
            onChange={(e) => setAcceptNote(e.target.value)}
            rows={3}
            placeholder="e.g. I have accepted your request and am arriving within 30 minutes."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-brand-accent focus:outline-none"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAcceptingReq(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isAccepting}>
              {isAccepting ? 'Accepting...' : 'Confirm & Accept'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingReq}
        onClose={() => setRejectingReq(null)}
        title="Decline Customer Request"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please specify why you cannot take this job right now:
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-brand-accent focus:outline-none"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setRejectingReq(null)}>
              Back
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isRejecting} className="bg-rose-600 hover:bg-rose-700">
              {isRejecting ? 'Declining...' : 'Decline Job'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={!!completingReq}
        onClose={() => setCompletingReq(null)}
        title="Complete Service & Problem Solved"
      >
        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Final Agreed Price (₹)
            </label>
            <Input
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="e.g. 450"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Direct settlement with customer. No commission cut taken by CivicSolve.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Note
            </label>
            <textarea
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              rows={2}
              placeholder="e.g. Repaired broken switch and tested circuit continuity."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-brand-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setCompletingReq(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isCompleting}>
              {isCompleting ? 'Submitting...' : 'Confirm Resolution'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
