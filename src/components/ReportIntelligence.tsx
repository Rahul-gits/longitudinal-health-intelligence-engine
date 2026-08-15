import React, { useState } from 'react';
import { ReportEngine, CrossReportComparisonResult } from '../engine/reportEngine';
import { LAB_MARKERS } from '../data/mockPatientData';
import { 
  FileText, 
  Upload, 
  TrendingDown, 
  CheckCircle, 
  FileCheck
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
      <div className="p-5 bg-[#FFE600] border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-black tracking-tight flex items-center gap-2 uppercase">
            <FileText className="w-6 h-6 stroke-[2.5]" /> REPORT INTELLIGENCE & DELTA COMPARATOR
          </h2>
          <p className="text-xs font-bold text-black/90 font-mono mt-1">
            OCR entity extraction, longitudinal biomarker trends, and cross-report delta analysis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#FFFFFF] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black font-mono">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 border transition-all cursor-pointer ${activeTab === 'trends' ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'}`}
          >
            Biomarker Trends
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 border transition-all cursor-pointer ${activeTab === 'comparison' ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'}`}
          >
            What Changed?
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 border transition-all cursor-pointer ${activeTab === 'upload' ? 'bg-black text-[#FFE600] border-black' : 'border-transparent text-black hover:bg-[#FFE600]'}`}
          >
            Upload OCR Test
          </button>
        </div>
      </div>

      {/* View 1: Biomarker Trends & Charts */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Marker Selector List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-black font-display text-black uppercase tracking-wider bg-[#FF70A6] text-black px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000] w-fit">
              TRACKED LAB MARKERS
            </h3>
            {LAB_MARKERS.map(marker => (
              <button
                key={marker.id}
                onClick={() => setSelectedMarkerId(marker.id)}
                className={`w-full p-3.5 border-2 border-black text-left transition-all cursor-pointer ${
                  selectedMarkerId === marker.id
                    ? 'bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
                    : 'bg-[#FFFFFF] shadow-[2px_2px_0px_0px_#000] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black font-display text-black text-xs">{marker.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-black border border-black ${
                    marker.trend === 'down' && marker.name.includes('eGFR') ? 'bg-[#FF70A6] text-black' :
                    marker.trend === 'up' && marker.name.includes('BNP') ? 'bg-[#FF6B35] text-white' : 'bg-[#CCFF00] text-black'
                  }`}>
                    {marker.trend === 'down' ? '↓ DECREASING' : marker.trend === 'up' ? '↑ INCREASING' : 'STABLE'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-black/80 mt-2">
                  <span>Ref: {marker.referenceRange}</span>
                  <span className="bg-black text-[#FFE600] px-1 border border-black">
                    Latest: {marker.history[marker.history.length - 1].value} {marker.unit}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Longitudinal Trend Chart (8 Cols) */}
          <div className="lg:col-span-8 p-5 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h3 className="text-base font-black font-display text-black">{selectedMarker.name} Longitudinal Progression</h3>
                <span className="text-xs font-mono font-bold text-black/80">Category: {selectedMarker.category} | Ref: {selectedMarker.referenceRange}</span>
              </div>
              <span className="px-3 py-1 font-mono font-black text-xs bg-[#00F5D4] text-black border border-black shadow-[2px_2px_0px_0px_#000]">
                2024 → 2026 TREND
              </span>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedMarker.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeWidth={1} />
                  <XAxis dataKey="year" stroke="#000000" tick={{ fill: '#000000', fontWeight: 'bold' }} />
                  <YAxis stroke="#000000" domain={['auto', 'auto']} tick={{ fill: '#000000', fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFE600', borderColor: '#000000', borderWidth: '2px', color: '#000000', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={4}
                    dot={{ fill: '#FF70A6', r: 6, stroke: '#000', strokeWidth: 2 }}
                    activeDot={{ r: 9, fill: '#00F5D4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-semibold text-black">
              <span className="font-black font-display text-black block mb-1 uppercase bg-[#FFE600] px-1 border border-black w-fit">AI CLINICAL INTERPRETATION</span>
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
          <div className="p-4 bg-[#00F5D4] border-3 border-black shadow-[5px_5px_0px_0px_#000] text-xs font-bold text-black">
            <span className="font-black font-display uppercase tracking-wider block mb-1 bg-black text-[#00F5D4] px-1.5 py-0.5 w-fit">CROSS-REPORT EXECUTIVE DELTA</span>
            <p className="mt-1 leading-relaxed">{comparison.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Worsened & Newly Abnormal */}
            <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <h3 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center gap-1.5 bg-[#FF70A6] px-2 py-1 border border-black">
                <TrendingDown className="w-4 h-4 stroke-[2.5]" /> Worsened or Newly Abnormal ({comparison.worsened.length})
              </h3>
              <div className="space-y-2.5">
                {comparison.worsened.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-black font-display">{item.marker}</span>
                      <span className="bg-[#FF6B35] text-white px-2 py-0.5 font-mono font-black text-[11px] border border-black">{item.from} → {item.to}</span>
                    </div>
                    <p className="text-black/90 font-semibold text-[11px]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved & Stable */}
            <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <h3 className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center gap-1.5 bg-[#CCFF00] px-2 py-1 border border-black">
                <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Improved or Stable ({comparison.improved.length + comparison.stable.length})
              </h3>
              <div className="space-y-2.5">
                {comparison.improved.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-black font-display">{item.marker}</span>
                      <span className="bg-[#CCFF00] text-black px-2 py-0.5 font-mono font-black text-[11px] border border-black">{item.from} → {item.to}</span>
                    </div>
                    <p className="text-black/90 font-semibold text-[11px]">{item.detail}</p>
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
          <div className="p-8 bg-[#FFFFFF] border-3 border-dashed border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-3">
            <div className="w-14 h-14 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mx-auto -rotate-2">
              <Upload className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-black">Upload New Medical Report / PDF / Imaging</h3>
              <p className="text-xs font-mono font-bold text-black/70 mt-1">Supports PDF lab sheets, discharge summaries, and prescription scans</p>
            </div>
            <button
              onClick={handleSimulateUpload}
              disabled={isUploading}
              className="px-6 py-3 bg-[#CCFF00] hover:bg-[#A3E635] text-black font-black font-display text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer uppercase"
            >
              {isUploading ? 'Processing OCR Extraction...' : 'Simulate OCR Report Upload'}
            </button>
          </div>

          {uploadedResult && (
            <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-display text-black uppercase tracking-wider flex items-center gap-1.5 bg-[#00F5D4] px-2 py-0.5 border border-black">
                  <FileCheck className="w-4 h-4 stroke-[2.5]" /> OCR Extraction ({uploadedResult.confidenceScore}% Conf)
                </span>
                <span className="text-[10px] font-mono font-bold text-black bg-[#FFE600] px-2 py-0.5 border border-black">File: Lab_Report_Aug_2026.pdf</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {uploadedResult.extractedEntities.map((ent: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <span className="text-black/70 text-[9px] font-black uppercase block">{ent.name}</span>
                    <span className="font-black text-black font-mono text-sm">{ent.value}</span>
                  </div>
                ))}
              </div>

              <pre className="p-3 bg-[#000000] text-[#FFE600] text-[11px] font-mono border-2 border-black overflow-x-auto font-bold">
                {uploadedResult.ocrTextSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
