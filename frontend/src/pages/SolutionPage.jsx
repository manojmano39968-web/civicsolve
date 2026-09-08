import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  FileText, CheckCircle2, AlertCircle, BarChart3, Users,
  MapPin, ShieldCheck, Layers, ArrowRight
} from 'lucide-react';

export default function SolutionPage() {
  const { id } = useParams();
  const challengeId = id || 1;
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChallengeById(challengeId)
      .then(data => setChallenge(data.challenge))
      .catch(err => console.error('Failed to load solution:', err))
      .finally(() => setLoading(false));
  }, [challengeId]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-subtle bg-teal-100 text-teal-800 border border-teal-200">
              Technical Specification
            </span>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              Ready for Pilot Review
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            GIS-Guided Decentralized Drainage & Blockage Clearance Intervention
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Engineering proposal formulated by the CivicSolve Flood Response Team for Velachery, Chennai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/impact/1"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            id="solution-view-impact-btn"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Pilot Impact</span>
          </Link>
        </div>
      </div>

      {/* Honest Scientific Disclaimer Banner */}
      <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-semibold">Engineering Feasibility Dossier (Hackathon MVP)</strong>
          <p className="text-slate-600 mt-0.5">
            This technical proposal represents a student & expert formulated intervention ready for municipal pilot review. It has not yet been physically deployed across the full urban municipality.
          </p>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {/* 1. Problem Definition */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Section 1.0</div>
          <h2 className="text-lg font-bold text-slate-900">Problem Characterization</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            During sustained rainfall exceeding 40mm/hr, the residential zone in Velachery experiences recurring surface waterlogging lasting 4 to 6 hours. Water accumulation reaches depths of 1.5 to 2.5 feet at three low-lying depression nodes, trapping pedestrian traffic and causing sewage back-siphonage in ground-floor dwellings.
          </p>
        </div>

        {/* 2. Field Analysis Findings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Section 2.0</div>
          <h2 className="text-lg font-bold text-slate-900">Hydrological & Geospatial Field Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Elevation Depressions</div>
              <p className="text-slate-600">GIS contour analysis mapped three critical low-lying junctions with 1.2m negative gradient relative to the canal outfall.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Culvert Choke Points</div>
              <p className="text-slate-600">Ultrasonic inspection identified 45% silt and plastic accumulation inside the primary 600mm conduit under Main Avenue.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">Discharge Capacity Deficit</div>
              <p className="text-slate-600">Peak storm runoff is 3.8 m³/s, whereas existing gravity conduits only permit 2.4 m³/s under maximum hydraulic head.</p>
            </div>
          </div>
        </div>

        {/* 3. Proposed Intervention */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Section 3.0</div>
          <h2 className="text-lg font-bold text-slate-900">Proposed Technical Intervention</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A three-tier hybrid intervention designed for high impact and low civil disruption:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700 pl-2">
            <li>
              <strong>Priority Desiltation:</strong> Mechanical clearance and silt-trap installation at the three identified choke points using Ravi Infrastructure's municipal suction units.
            </li>
            <li>
              <strong>Perforated Runoff Grates:</strong> Deployment of high-throughput perforated road grates at junction depression nodes to maximize initial gravity intake.
            </li>
            <li>
              <strong>Auxiliary Gravity Bypass:</strong> A 400-meter auxiliary 300mm precast pipe linking directly to the secondary secondary stormwater canal to handle peak monsoon surge.
            </li>
          </ul>
        </div>

        {/* 4. Expected Outcome & Pilot Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Section 4.0</div>
            <h3 className="font-bold text-base text-slate-900">Expected Outcome</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target reduction of waterlogging duration from 5.0 hours to under 2.0 hours, reducing affected residential surface area by 50% and protecting 450+ vulnerable households from property damage.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Section 5.0</div>
            <h3 className="font-bold text-base text-slate-900">Pilot Implementation Timeline</h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Phase 1 (Week 1-2):</span> <span>Choke Desiltation & Grate Installation</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Phase 2 (Week 3-4):</span> <span>400m Bypass Trenchless Excavation</span>
              </div>
              <div className="flex justify-between">
                <span>Phase 3 (Week 5):</span> <span>Monsoon Runoff Flow Measurement</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Team Contributors */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-slate-900">Multidisciplinary Team Authors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900">Arjun Kumar</div>
              <div className="text-slate-500">Civil Engineering Student</div>
              <div className="text-teal-700 font-medium mt-1">Role: GIS Contour & Spatial Elevation Mapping</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900">Dr. Meena Raman</div>
              <div className="text-slate-500">Hydrology Faculty Expert</div>
              <div className="text-teal-700 font-medium mt-1">Role: Hydraulic Peak Discharge Calculation</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900">Ravi Infrastructure Solutions</div>
              <div className="text-slate-500">Municipal Contractor Partner</div>
              <div className="text-teal-700 font-medium mt-1">Role: Desiltation & Civil Execution Review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
