import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { 
  User, 
  Heart, 
  FileUp, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  X, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  FileCheck2
} from 'lucide-react';

export const ProfileSetupView: React.FC = () => {
  const { user, submitProfile, isLoading } = useAuth();
  const [step, setStep] = useState<number>(1);

  // Step 1: Basic Information
  const [dob, setDob] = useState<string>('1985-05-15');
  const [sex, setSex] = useState<string>('Female');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [communicationPref, setCommunicationPref] = useState<string>('Email & SMS');

  // Step 2: Health Context
  const [conditions, setConditions] = useState<string[]>([
    'Heart Failure with Preserved Ejection Fraction (HFpEF)',
    'Chronic Kidney Disease (Stage 3b)'
  ]);
  const [newConditionInput, setNewConditionInput] = useState<string>('');

  const [medications, setMedications] = useState<string[]>([
    'Empagliflozin 10mg',
    'Furosemide 40mg',
    'Spironolactone 25mg'
  ]);
  const [newMedicationInput, setNewMedicationInput] = useState<string>('');

  const [allergies, setAllergies] = useState<string[]>([
    'NSAIDs (Ibuprofen/Naproxen)',
    'Penicillin'
  ]);
  const [newAllergyInput, setNewAllergyInput] = useState<string>('');

  // Step 3: Health Data Upload Simulation
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleAddCondition = () => {
    if (newConditionInput.trim() && !conditions.includes(newConditionInput.trim())) {
      setConditions([...conditions, newConditionInput.trim()]);
      setNewConditionInput('');
    }
  };

  const handleAddMedication = () => {
    if (newMedicationInput.trim() && !medications.includes(newMedicationInput.trim())) {
      setMedications([...medications, newMedicationInput.trim()]);
      setNewMedicationInput('');
    }
  };

  const handleAddAllergy = () => {
    if (newAllergyInput.trim() && !allergies.includes(newAllergyInput.trim())) {
      setAllergies([...allergies, newAllergyInput.trim()]);
      setNewAllergyInput('');
    }
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setUploadedFiles(['EHR_Lab_Panel_Sept2026.pdf', 'Echocardiogram_Report_HFpEF.pdf']);
      setIsUploading(false);
    }, 1200);
  };

  const handleFinish = async (skipData: boolean = false) => {
    await submitProfile({
      dob,
      sex,
      preferredLanguage,
      communicationPref,
      conditions,
      medications,
      allergies,
      hasUploadedRecords: !skipData && uploadedFiles.length > 0
    });
  };

  return (
    <AuthLayout
      title="Let's set up your health profile"
      subtitle={`Step ${step} of 3 • ${
        step === 1 ? 'Basic Information' : step === 2 ? 'Health Context' : 'Health Data & Records'
      }`}
    >
      {/* 3-Step Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#667085] mb-2">
          <span className={step >= 1 ? 'text-[#2563EB]' : ''}>1. Basic Info</span>
          <span className={step >= 2 ? 'text-[#2563EB]' : ''}>2. Context</span>
          <span className={step >= 3 ? 'text-[#2563EB]' : ''}>3. Data</span>
        </div>
        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Date of birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Biological sex
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Female', 'Male', 'Other'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSex(option)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    sex === option
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                      : 'bg-white border-[#DCE2E8] text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Preferred language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="English">English</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="French">Français (French)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Communication preference
            </label>
            <select
              value={communicationPref}
              onChange={(e) => setCommunicationPref(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DCE2E8] rounded-xl text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="Email & SMS">Email & SMS Alerts</option>
              <option value="SMS Only">SMS Only</option>
              <option value="In-App Only">In-App Notifications Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full mt-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Health Context */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Conditions */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Diagnosed Conditions
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {conditions.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#1E40AF] rounded-lg text-xs font-medium border border-[#BFDBFE]"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => setConditions(conditions.filter((item) => item !== c))}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newConditionInput}
                onChange={(e) => setNewConditionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                className="flex-1 px-3 py-1.5 bg-white border border-[#DCE2E8] rounded-xl text-xs text-[#172033]"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-xs font-bold rounded-xl border border-[#CBD5E1]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Current Medications
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {medications.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ECFDF5] text-[#065F46] rounded-lg text-xs font-medium border border-[#A7F3D0]"
                >
                  {m}
                  <button
                    type="button"
                    onClick={() => setMedications(medications.filter((item) => item !== m))}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMedicationInput}
                onChange={(e) => setNewMedicationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
                placeholder="e.g. Metformin 500mg, Atorvastatin"
                className="flex-1 px-3 py-1.5 bg-white border border-[#DCE2E8] rounded-xl text-xs text-[#172033]"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-xs font-bold rounded-xl border border-[#CBD5E1]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Known Allergies / Intolerances
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FEF2F2] text-[#991B1B] rounded-lg text-xs font-medium border border-[#FECACA]"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => setAllergies(allergies.filter((item) => item !== a))}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergyInput}
                onChange={(e) => setNewAllergyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                placeholder="e.g. Sulfa, NSAIDs, Peanuts"
                className="flex-1 px-3 py-1.5 bg-white border border-[#DCE2E8] rounded-xl text-xs text-[#172033]"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] text-xs font-bold rounded-xl border border-[#CBD5E1]"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-4 bg-white hover:bg-[#F8FAFC] text-[#475569] font-semibold text-xs rounded-xl border border-[#DCE2E8] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Health Data & Upload */}
      {step === 3 && (
        <div className="space-y-4 text-xs">
          <p className="text-[#475569]">
            Do you have previous laboratory reports, clinic summaries, or discharge summaries you'd like to import?
          </p>

          {/* Upload Area */}
          <div className="p-5 border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-[#F8FAFC] text-center space-y-3">
            <div className="w-10 h-10 bg-[#EFF6FF] text-[#2563EB] rounded-full mx-auto flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-[#1E293B]">Upload PDF / Image Health Records</p>
              <p className="text-[11px] text-[#667085] mt-0.5">Supports PDF, FHIR JSON, JPG, PNG (Max 25MB)</p>
            </div>

            <button
              type="button"
              onClick={handleSimulateUpload}
              disabled={isUploading}
              className="py-2 px-4 bg-white hover:bg-[#F1F5F9] text-[#2563EB] font-bold rounded-xl border border-[#BFDBFE] text-xs shadow-xs transition-colors cursor-pointer"
            >
              {isUploading ? 'Extracting clinical entities…' : 'Select Files to Upload'}
            </button>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-1.5 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl">
              <div className="font-bold text-[#065F46] text-[11px] flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{uploadedFiles.length} Records Ingested & Verified</span>
              </div>
              {uploadedFiles.map((f) => (
                <div key={f} className="text-[#047857] text-[11px] font-mono pl-4.5">
                  • {f}
                </div>
              ))}
            </div>
          )}

          {/* Prompt informing user they can skip */}
          <div className="p-3 bg-[#F1F5F9] rounded-xl text-[#475569] text-[11px]">
            <strong>No records yet? That's completely fine.</strong> You can add your health reports later anytime from "My Health Data".
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => handleFinish(false)}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Heal Engine…</span>
                </>
              ) : (
                <>
                  <span>{uploadedFiles.length > 0 ? 'Save & Open Dashboard' : 'Go to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleFinish(true)}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#1E293B] font-medium text-xs rounded-xl border border-[#DCE2E8] transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
