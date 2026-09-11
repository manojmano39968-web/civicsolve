import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  BarChart3,
  FileText,
  Users,
  CheckSquare,
  Star,
  RefreshCw,
  AlertCircle,
  Save,
  RotateCcw,
  Building,
  GraduationCap,
  Briefcase,
  Search,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Button, Badge, Card } from '../../components/ui/index.ts';
import {
  PlatformMetrics,
  VerificationAttestation,
  MatchingConfiguration,
  AuditLogEntry,
} from '@civicsolve/shared';

export function AdminDashboard() {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'metrics' | 'attestations' | 'weights' | 'audit'>('metrics');
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [attestations, setAttestations] = useState<VerificationAttestation[]>([]);
  const [attestationFilter, setAttestationFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [weights, setWeights] = useState<MatchingConfiguration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Review modal state
  const [selectedAttestation, setSelectedAttestation] = useState<VerificationAttestation | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'VERIFIED' | 'REJECTED' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, attestationsRes, weightsRes, auditRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/attestations'),
        api.get('/admin/weights'),
        api.get('/admin/audit-logs?limit=30'),
      ]);

      setMetrics(metricsRes.data.data);
      setAttestations(attestationsRes.data.data);
      setWeights(weightsRes.data.data);
      setAuditLogs(auditRes.data.data);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showNotification(err.response?.data?.error?.message || 'Failed to load administrative data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchAllData();
    }
  }, [isAuthenticated, user]);

  // If not admin, show access denied
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Admin Portal Restricted</h2>
          <p className="text-sm text-slate-500">
            You must be logged in as a CivicSolve platform administrator to access system telemetry, verification queues, and algorithm tuning.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => openAuthModal('login')}
            >
              Sign In as Administrator
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleReviewSubmit = async () => {
    if (!selectedAttestation || !reviewDecision) return;
    setIsSaving(true);
    try {
      await api.patch(`/admin/attestations/${selectedAttestation.id}`, {
        decision: reviewDecision,
        notes: reviewNotes,
      });

      showNotification(`Provider ${selectedAttestation.providerName} has been ${reviewDecision.toLowerCase()}.`);
      setSelectedAttestation(null);
      setReviewDecision(null);
      setReviewNotes('');
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error?.message || 'Failed to update verification status.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev =>
      prev.map(w => (w.key === key ? { ...w, weight: Math.round(value * 100) / 100 } : w))
    );
  };

  const handleSaveWeights = async () => {
    setIsSaving(true);
    try {
      await api.put('/admin/weights', {
        weights: weights.map(w => ({ key: w.key, weight: w.weight })),
      });
      showNotification('Matching algorithm weights updated successfully.');
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error?.message || 'Failed to update weights.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWeights = async () => {
    if (!window.confirm('Reset all matching weights to factory defaults?')) return;
    setIsSaving(true);
    try {
      const res = await api.post('/admin/weights/reset');
      setWeights(res.data.data);
      showNotification('Matching algorithm weights reset to factory defaults.');
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error?.message || 'Failed to reset weights.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalWeightSum = weights.reduce((sum, w) => sum + w.weight, 0);
  const filteredAttestations = attestations.filter(a =>
    attestationFilter === 'ALL' ? true : a.status === attestationFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-brand-primary">CivicSolve V2</span>
            <Badge variant="accent">Administrator Console</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Platform governance, credential verification triage, and explainable algorithm tuning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchAllData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'metrics'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Platform Telemetry
        </button>

        <button
          onClick={() => setActiveTab('attestations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'attestations'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Verification Queue
          {attestations.filter(a => a.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
              {attestations.filter(a => a.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('weights')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'weights'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Algorithm Weight Tuner
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Trail
        </button>
      </div>

      {/* TAB 1: Platform Telemetry */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.totalUsers}</div>
              <div className="text-xs text-slate-500 flex gap-2">
                <span>{metrics.totalNeeders} Needers</span>
                <span>•</span>
                <span>{metrics.totalProviders} Providers</span>
              </div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Verified Solvers</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.verifiedProviders}</div>
              <div className="text-xs text-slate-500">
                {metrics.totalProviders > 0
                  ? `${Math.round((metrics.verifiedProviders / metrics.totalProviders) * 100)}% of total providers`
                  : 'No providers registered yet'}
              </div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Solutions Delivered</span>
                <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.completedRequests}</div>
              <div className="text-xs text-slate-500">
                Out of {metrics.totalRequests} total requests
              </div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Bayesian Satisfaction</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.averageRating.toFixed(2)} / 5.0</div>
              <div className="text-xs text-slate-500">
                Across {metrics.totalReviews} verified reviews
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-primary" />
              Unmet Civic Demand & Discovery Gaps
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Queries logged where solution seekers requested services with low or zero immediate local coverage.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-slate-800">{metrics.unmetRequirementsCount}</div>
                <div className="text-xs text-slate-500">Unfulfilled search queries logged</div>
              </div>
              <Badge variant="neutral">Auto-Aggregated</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Verification Queue */}
      {activeTab === 'attestations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setAttestationFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    attestationFilter === filter
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredAttestations.length} attestations
            </span>
          </div>

          {filteredAttestations.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No attestations found</div>
              <div className="text-xs text-slate-500">No submissions match the current filter.</div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAttestations.map(att => (
                <Card key={att.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{att.providerName}</span>
                      <span className="text-xs text-slate-500">({att.providerTitle})</span>
                      <Badge
                        variant={
                          att.status === 'VERIFIED'
                            ? 'success'
                            : att.status === 'REJECTED'
                            ? 'danger'
                            : 'accent'
                        }
                      >
                        {att.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {att.attestationType === 'BUSINESS_REG' && <Building className="w-3.5 h-3.5 text-blue-600" />}
                      {att.attestationType === 'CAMPUS_EMAIL' && <GraduationCap className="w-3.5 h-3.5 text-purple-600" />}
                      {att.attestationType === 'PORTFOLIO_LINK' && <Briefcase className="w-3.5 h-3.5 text-amber-600" />}
                      <span className="font-medium text-slate-700">{att.attestationType}:</span>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {att.referenceData}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Submitted on {new Date(att.createdAt).toLocaleDateString()} at {new Date(att.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  {att.status === 'PENDING' && (
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedAttestation(att);
                          setReviewDecision('REJECTED');
                        }}
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedAttestation(att);
                          setReviewDecision('VERIFIED');
                        }}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Approve & Verify
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Algorithm Weight Tuner */}
      {activeTab === 'weights' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-primary" />
                  Transparent Explainable Ranking Weights
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust the relative weights used by the 10-layer matching algorithm to rank service providers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">Total Weight:</span>
                  <span
                    className={`font-black ${
                      Math.abs(totalWeightSum - 1.0) < 0.05
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {(totalWeightSum * 100).toFixed(0)}% ({totalWeightSum.toFixed(2)})
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetWeights}
                  disabled={isSaving}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Defaults
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveWeights}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Weights
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weights.map(w => (
                <div key={w.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800 font-mono">{w.key}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{w.description}</div>
                    </div>
                    <div className="text-base font-black text-brand-primary font-mono ml-4">
                      {(w.weight * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={w.weight}
                      onChange={e => handleWeightChange(w.key, parseFloat(e.target.value))}
                      className="w-full accent-brand-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-500 w-10 text-right">
                      {w.weight.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-primary" />
              System Audit Records
            </h3>

            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No audit logs recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-600 font-medium">{log.entityType}</span>
                        {log.userEmail && (
                          <span className="text-slate-400">by {log.userEmail}</span>
                        )}
                      </div>
                      {log.detailsJson && (
                        <div className="font-mono text-[11px] text-slate-500 break-all bg-slate-50 p-1.5 rounded border border-slate-100">
                          {log.detailsJson}
                        </div>
                      )}
                    </div>
                    <div className="text-slate-400 shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {selectedAttestation && reviewDecision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-white shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {reviewDecision === 'VERIFIED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              {reviewDecision === 'VERIFIED' ? 'Approve Verification' : 'Reject Verification'}
            </h3>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{selectedAttestation.providerName}</div>
              <div className="text-slate-600">Type: {selectedAttestation.attestationType}</div>
              <div className="font-mono text-slate-700">{selectedAttestation.referenceData}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Notes (optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Reason for decision, verified registration number, or rejection feedback..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAttestation(null);
                  setReviewDecision(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={reviewDecision === 'VERIFIED' ? 'primary' : 'secondary'}
                size="sm"
                onClick={handleReviewSubmit}
                isLoading={isSaving}
                className={reviewDecision === 'REJECTED' ? 'text-rose-600 hover:bg-rose-50 border-rose-200' : ''}
              >
                Confirm {reviewDecision === 'VERIFIED' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
