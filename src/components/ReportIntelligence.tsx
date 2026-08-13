import React, { useState } from 'react';
import { ReportEngine, CrossReportComparisonResult } from '../engine/reportEngine';
import { LAB_MARKERS } from '../data/mockPatientData';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  FileCheck,
  Search
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ReportIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'comparison' | 'upload'>('trends');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('lm-egfr');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedResult, setUploadedResult] = useState<any>(null);

  const comparison: CrossReportComparisonResult = ReportEngine.compareReports(2025, 2026);
  const selectedMarker = LAB_MARKERS.find(m => m.id === selectedMarkerId) || LAB_MARKERS[0];

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadedResult(ReportEngine.processUploadedReport('Lab_Report_Aug_2026.pdf'));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Medical Report Intelligence & Delta Comparator
          </h2>
          <p className="text-xs text-slate-400">
            Document understanding, OCR entity extraction, longitudinal biomarker trends, and "What Changed?" cross-report analysis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'trends' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Biomarker Trends
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'comparison' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            What Changed? (Delta)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'upload' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Upload / OCR Test
          </button>
        </div>
      </div>

      {/* View 1: Biomarker Trends & Charts */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Marker Selector List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tracked Laboratory Markers</h3>
            {LAB_MARKERS.map(marker => (
              <button
                key={marker.id}
                onClick={() => setSelectedMarkerId(marker.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  selectedMarkerId === marker.id
                    ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-[#131B2E] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{marker.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    marker.trend === 'down' && marker.name.includes('eGFR') ? 'bg-rose-500/20 text-rose-400' :
                    marker.trend === 'up' && marker.name.includes('BNP') ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {marker.trend === 'down' ? '↓ Decreasing' : marker.trend === 'up' ? '↑ Increasing' : 'Stable'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Ref: {marker.referenceRange}</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    Latest: {marker.history[marker.history.length - 1].value} {marker.unit}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Longitudinal Trend Chart (8 Cols) */}
          <div className="lg:col-span-8 p-4 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedMarker.name} Longitudinal Progression</h3>
                <span className="text-xs text-slate-400">Category: {selectedMarker.category} | Reference: {selectedMarker.referenceRange}</span>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-900 text-cyan-400 border border-slate-800">
                2024 → 2026 Trend
              </span>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedMarker.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="year" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ fill: '#06B6D4', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-cyan-400 block mb-1">AI Clinical Interpretation</span>
              {selectedMarker.name.includes('eGFR') ? (
                'Significant eGFR drop from 64 mL/min (2025) to 52 mL/min (2026). Stage shift from 2 to 3a flagged due to drug-drug interaction.'
              ) : selectedMarker.name.includes('BNP') ? (
                'NT-proBNP rose sharply to 480 pg/mL, indicating increased ventricular wall stretch and mild fluid expansion.'
              ) : (
                'Biomarker trajectory monitored cleanly.'
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 2: What Changed? (Cross-Report Comparison) */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block mb-1">Cross-Report Executive Delta</span>
            <p className="text-slate-200">{comparison.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Worsened & Newly Abnormal */}
            <div className="p-4 rounded-2xl bg-[#131B2E] border border-rose-500/30 space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Worsened or Newly Abnormal ({comparison.worsened.length})
              </h3>
              <div className="space-y-2">
                {comparison.worsened.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{item.marker}</span>
                      <span className="text-rose-400 font-mono text-[11px]">{item.from} → {item.to}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved & Stable */}
            <div className="p-4 rounded-2xl bg-[#131B2E] border border-emerald-500/30 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Improved or Stable ({comparison.improved.length + comparison.stable.length})
              </h3>
              <div className="space-y-2">
                {comparison.improved.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{item.marker}</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{item.from} → {item.to}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Document Upload & OCR Test */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="p-8 rounded-2xl bg-[#131B2E] border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition-all text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload New Medical Report / PDF / Imaging</h3>
              <p className="text-xs text-slate-400 mt-0.5">Supports PDF lab sheets, discharge summaries, and prescription scans</p>
            </div>
            <button
              onClick={handleSimulateUpload}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
            >
              {isUploading ? 'Processing OCR & Entity Normalization...' : 'Simulate OCR Report Upload'}
            </button>
          </div>

          {uploadedResult && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> OCR Entity Extraction Result ({uploadedResult.confidenceScore}% Confidence)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Parsed: Lab_Report_Aug_2026.pdf</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {uploadedResult.extractedEntities.map((ent: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">{ent.name}</span>
                    <span className="font-bold text-white font-mono">{ent.value}</span>
                  </div>
                ))}
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-400 font-mono overflow-x-auto">
                {uploadedResult.ocrTextSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
