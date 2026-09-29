import { useState } from 'react';
import { DecisionSynthesisResult } from '../types/health';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  HelpCircle, 
  ShieldAlert, 
  BookOpen, 
  Check, 
  Lock,
  FileCheck
} from 'lucide-react';

interface ClinicianReviewWorkflowProps {
  synthesis: DecisionSynthesisResult;
  onApprove: (notes: string) => void;
  onModify: (modifiedRec: string, notes: string) => void;
  onReject: (reason: string) => void;
}

export const ClinicianReviewWorkflow: React.FC<ClinicianReviewWorkflowProps> = ({
  synthesis,
  onApprove,
  onModify,
  onReject
}) => {
  const [reviewStatus, setReviewStatus] = useState<'PENDING_REVIEW' | 'APPROVED' | 'MODIFIED' | 'REJECTED'>(synthesis.clinicianActionStatus);
  const [clinicianNotes, setClinicianNotes] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [modifiedText, setModifiedText] = useState<string>(synthesis.primaryRecommendation);
  const [showEvidenceChain, setShowEvidenceChain] = useState<boolean>(false);

  const handleApprove = () => {
    setReviewStatus('APPROVED');
    onApprove(clinicianNotes);
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewStatus('MODIFIED');
    setIsModifying(false);
    onModify(modifiedText, clinicianNotes);
  };

  const handleReject = () => {
    setReviewStatus('REJECTED');
    onReject(clinicianNotes || 'Rejected during clinician review');
  };

  return (
    <div className="p-5 bg-[#FFFFFF] border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-4 font-mono">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b-3 border-black pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black">
            <FileCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black font-display uppercase tracking-wider text-black">
              MANDATORY CLINICIAN REVIEW & HUMAN-IN-THE-LOOP ACTION
            </h3>
            <p className="text-xs font-bold text-black/70">AI outputs require explicit clinician approval before EHR action</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-black uppercase">STATUS:</span>
          <span className={`px-3 py-1 font-black text-xs border border-black shadow-[2px_2px_0px_0px_#000] ${
            reviewStatus === 'APPROVED' ? 'bg-[#CCFF00] text-black' :
            reviewStatus === 'MODIFIED' ? 'bg-[#3A86FF] text-white' :
            reviewStatus === 'REJECTED' ? 'bg-[#FF5722] text-white' : 'bg-[#FFE600] text-black animate-pulse'
          }`}>
            {reviewStatus}
          </span>
        </div>
      </div>

      {/* Primary Recommendation Card */}
      <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
        <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
          <span className="text-black/70">SYNTHESIZED CLINICAL RECOMMENDATION:</span>
          <span className="text-[#F43F5E] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
            SAFETY HARD-CHECK: {synthesis.safetyResult.status}
          </span>
        </div>

        {!isModifying ? (
          <p className="text-sm font-extrabold text-black leading-relaxed font-sans bg-white p-3 border border-black mt-1">
            "{modifiedText}"
          </p>
        ) : (
          <form onSubmit={handleModifySubmit} className="mt-2 space-y-2">
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              className="w-full bg-white border-2 border-black p-3 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000] min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModifying(false)}
                className="px-3 py-1 bg-white text-black text-xs font-black border border-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#3A86FF] text-white text-xs font-black border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                Save Modification
              </button>
            </div>
          </form>
        )}

        {/* Evidence Chain Drawer Trigger */}
        <div className="mt-3 pt-2 border-t border-black/20 flex flex-wrap items-center justify-between text-xs font-bold">
          <button
            onClick={() => setShowEvidenceChain(!showEvidenceChain)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000] hover:bg-[#CCFF00] cursor-pointer uppercase font-black"
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{showEvidenceChain ? 'Hide Evidence Chain' : 'View Complete Evidence Chain'}</span>
          </button>

          <span className="text-[11px] text-black/70">
            Guideline Citation: {synthesis.evidenceChain.guidelineCitation}
          </span>
        </div>

        {/* Evidence Chain Details Drawer */}
        {showEvidenceChain && (
          <div className="mt-3 p-3 bg-white border-2 border-black text-xs space-y-2 animate-in fade-in">
            <div className="font-black text-[11px] uppercase border-b border-black pb-1 text-[#3A86FF]">
              EVIDENCE CHAIN & REASONING PROVENANCE:
            </div>
            <div>
              <span className="font-black text-black block">1. PATIENT SPECIFIC REASON:</span>
              <span className="text-black/90 font-sans">{synthesis.evidenceChain.patientReason}</span>
            </div>
            <div>
              <span className="font-black text-black block">2. PATIENT LAB EVIDENCE:</span>
              <span className="text-black/90 font-sans">{synthesis.evidenceChain.patientEvidence}</span>
            </div>
            <div>
              <span className="font-black text-black block">3. AUTHORITATIVE GUIDELINE CITATION:</span>
              <span className="text-black/90 font-sans">{synthesis.evidenceChain.guidelineCitation}</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-black pt-1">
              <span>STRENGTH: <span className="text-[#00F5D4]">{synthesis.evidenceChain.evidenceStrength}</span></span>
              <span>UNCERTAINTY: <span className="text-[#FF6B35]">{synthesis.evidenceChain.uncertaintyLevel}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Clinician Action Buttons */}
      {reviewStatus === 'PENDING_REVIEW' && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Clinician Notes / Justification (Optional):</label>
            <input
              type="text"
              value={clinicianNotes}
              onChange={(e) => setClinicianNotes(e.target.value)}
              placeholder="Add physician notes prior to EHR sync..."
              className="w-full bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs font-bold text-black focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleApprove}
                className="px-5 py-2.5 bg-[#CCFF00] hover:bg-[#A3E635] text-black font-black font-display text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center space-x-1.5 cursor-pointer uppercase"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Approve Recommendation</span>
              </button>

              <button
                onClick={() => setIsModifying(true)}
                className="px-4 py-2.5 bg-[#3A86FF] hover:bg-[#2563EB] text-white font-black font-display text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center space-x-1.5 cursor-pointer uppercase"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                <span>Modify</span>
              </button>
            </div>

            <button
              onClick={handleReject}
              className="px-4 py-2.5 bg-[#FF5722] hover:bg-[#DC2626] text-white font-black font-display text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center space-x-1.5 cursor-pointer uppercase"
            >
              <XCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Action State */}
      {reviewStatus !== 'PENDING_REVIEW' && (
        <div className="p-3 bg-[#CCFF00]/30 border-2 border-black flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-black stroke-[3]" />
            Action verified by Dr. Aris Thorne. Ready for FHIR R4 EHR audit logging.
          </span>
          <button
            onClick={() => setReviewStatus('PENDING_REVIEW')}
            className="px-3 py-1 bg-white text-black font-black text-[10px] border border-black cursor-pointer uppercase"
          >
            Re-evaluate
          </button>
        </div>
      )}
    </div>
  );
};
