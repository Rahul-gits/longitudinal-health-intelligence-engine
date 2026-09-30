import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Activity, 
  Pill, 
  ShieldAlert, 
  Sliders, 
  Plus, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  PhoneCall,
  Calendar,
  Heart,
  Stethoscope,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDynamicPatientProfile, calculateAgeFromDob } from '../data/mockPatientData';

export type EditProfileTab = 'demographics' | 'conditions' | 'medications' | 'allergies' | 'preferences';

interface EditPatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: EditProfileTab;
}

const COMMON_CONDITIONS = [
  'Heart Failure with Preserved Ejection Fraction (HFpEF)',
  'Chronic Kidney Disease (Stage 3b)',
  'Type 2 Diabetes Mellitus',
  'Essential Hypertension (Stage 1)',
  'Osteoarthritis (Bilateral Knees)',
  'Severe Persistent Asthma',
  'Atrial Fibrillation',
  'Coronary Artery Disease',
  'Hyperlipidemia'
];

const COMMON_MEDICATIONS = [
  'Empagliflozin 10mg (Daily morning)',
  'Lisinopril 20mg (Daily morning)',
  'Furosemide 40mg (Daily morning)',
  'Spironolactone 25mg (Daily)',
  'Metformin 500mg (Daily with dinner)',
  'Atorvastatin 20mg (Bedtime)',
  'Topical Diclofenac 1% Gel (PRN)',
  'Bisoprolol 5mg (Daily morning)',
  'Albuterol Inhaler (PRN)'
];

const COMMON_ALLERGIES = [
  'NSAIDs (Ibuprofen/Naproxen - Avoid)',
  'Penicillin (Severe: Anaphylaxis/Hives)',
  'Sulfa Drugs (Moderate: Rash)',
  'Cephalosporins',
  'IV Radiocontrast Dye',
  'Latex'
];

export const EditPatientProfileModal: React.FC<EditPatientProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'demographics'
}) => {
  const { user, updateProfile } = useAuth();
  const currentProfile = getDynamicPatientProfile(user);

  const [activeTab, setActiveTab] = useState<EditProfileTab>(initialTab);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [sex, setSex] = useState<string>('Female');
  const [bloodType, setBloodType] = useState<string>('A+');
  const [primaryPhysician, setPrimaryPhysician] = useState<string>('');
  const [baselineStatus, setBaselineStatus] = useState<string>('Needs Clinician Review');

  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState<string>('');

  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState<string>('');

  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState<string>('');

  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [communicationPref, setCommunicationPref] = useState<string>('SMS & Mobile App');
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>('');

  // Sync state whenever modal opens or user profile changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'demographics');
      setFullName(user?.fullName || currentProfile.name);
      setDob(user?.profile?.dob || (currentProfile as any).dob || '1958-03-14');
      setSex(user?.profile?.sex || currentProfile.gender || 'Female');
      setBloodType(user?.profile?.bloodType || currentProfile.bloodType || 'A+');
      setPrimaryPhysician(user?.profile?.primaryPhysician || currentProfile.primaryPhysician || 'Dr. Aris Thorne, MD (Cardiology)');
      setBaselineStatus(user?.profile?.baselineStatus || currentProfile.status || 'Needs Clinician Review');

      setConditions([...currentProfile.conditions]);
      setMedications([...currentProfile.medications]);
      setAllergies([...currentProfile.allergies]);

      setPreferredLanguage(user?.profile?.preferredLanguage || (currentProfile as any).preferredLanguage || 'English');
      setCommunicationPref(user?.profile?.communicationPref || (currentProfile as any).communicationPref || 'SMS & Mobile App');
      setEmergencyContactName(user?.profile?.emergencyContactName || (currentProfile as any).emergencyContactName || 'Thomas Vance (Son)');
      setEmergencyContactPhone(user?.profile?.emergencyContactPhone || (currentProfile as any).emergencyContactPhone || '(555) 234-8901');

      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen) return null;

  const calculatedAge = calculateAgeFromDob(dob);

  // Condition Handlers
  const handleAddCondition = (cond: string) => {
    const trimmed = cond.trim();
    if (trimmed && !conditions.includes(trimmed)) {
      setConditions(prev => [...prev, trimmed]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  // Medication Handlers
  const handleAddMedication = (med: string) => {
    const trimmed = med.trim();
    if (trimmed && !medications.includes(trimmed)) {
      setMedications(prev => [...prev, trimmed]);
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  // Allergy Handlers
  const handleAddAllergy = (allg: string) => {
    const trimmed = allg.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies(prev => [...prev, trimmed]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(prev => prev.filter((_, i) => i !== index));
  };

  // Reset to default Eleanor Vance cohort clinical data
  const handleResetDefaults = () => {
    setFullName('Eleanor Vance');
    setDob('1958-03-14');
    setSex('Female');
    setBloodType('A+');
    setPrimaryPhysician('Dr. Aris Thorne, MD (Cardiology)');
    setBaselineStatus('Needs Clinician Review');
    setConditions([
      'Heart Failure with Preserved Ejection Fraction (HFpEF)',
      'Chronic Kidney Disease (Stage 3b)',
      'Type 2 Diabetes Mellitus'
    ]);
    setMedications([
      'Empagliflozin 10mg',
      'Furosemide 40mg',
      'Spironolactone 25mg'
    ]);
    setAllergies(['Sulfa drugs', 'NSAIDs (Avoid)']);
    setPreferredLanguage('English');
    setCommunicationPref('SMS & Mobile App');
    setEmergencyContactName('Thomas Vance (Son)');
    setEmergencyContactPhone('(555) 234-8901');
  };

  // Save handler
  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Patient full name cannot be blank.');
      setActiveTab('demographics');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const ok = await updateProfile({
        fullName: fullName.trim(),
        dob,
        sex,
        bloodType,
        primaryPhysician: primaryPhysician.trim(),
        baselineStatus,
        conditions,
        medications,
        allergies,
        preferredLanguage,
        communicationPref,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim()
      });

      if (ok) {
        setSuccessMessage('Patient profile & clinical records successfully updated!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage('Failed to save profile. Please verify fields and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected error occurred while updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white border-3 border-black shadow-[8px_8px_0px_0px_#000] rounded-none my-6 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="bg-[#FFE600] border-b-3 border-black p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-[#FFE600] flex items-center justify-center font-display font-extrabold text-lg border-2 border-black -rotate-2">
              {fullName ? fullName[0].toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black font-display text-black tracking-tight">
                  Edit Patient Profile & Health Data
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold uppercase border border-black">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs font-bold text-black/80 font-mono">
                Update patient demographics, active conditions, prescriptions, allergies & care team preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white hover:bg-black hover:text-white text-black border-2 border-black flex items-center justify-center font-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
            title="Close without saving"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FAF8F5] border-b-2 border-black px-4 sm:px-6 pt-3 shrink-0 overflow-x-auto scrollbar-none flex space-x-2">
          {[
            { id: 'demographics', label: 'Demographics', icon: User, badge: `${calculatedAge}y / ${sex[0]}` },
            { id: 'conditions', label: 'Conditions', icon: Activity, badge: `${conditions.length}` },
            { id: 'medications', label: 'Medications', icon: Pill, badge: `${medications.length}` },
            { id: 'allergies', label: 'Allergies', icon: ShieldAlert, badge: `${allergies.length}` },
            { id: 'preferences', label: 'Preferences & Contact', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as EditProfileTab)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-mono font-extrabold border-t-2 border-l-2 border-r-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black -mb-[2px] pb-3 shadow-[2px_-2px_0px_0px_#000]'
                    : 'bg-black/5 hover:bg-black/10 text-black/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold border ${
                    isActive ? 'bg-black text-[#FFE600] border-black' : 'bg-black/10 text-black border-black/20'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-[#00F5D4] text-black border-2 border-black font-mono font-bold text-xs flex items-center justify-between shadow-[3px_3px_0px_0px_#000] animate-fadeIn">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-[#FF5722] text-white border-2 border-black font-mono font-bold text-xs flex items-center space-x-2 shadow-[3px_3px_0px_0px_#000]">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: DEMOGRAPHICS */}
          {activeTab === 'demographics' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-display shadow-[2px_2px_0px_0px_#000] focus:bg-[#FFE600]/10 focus:outline-none"
                  />
                </div>

                {/* Date of Birth & Calculated Age */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                      Date of Birth
                    </label>
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 bg-[#CCFF00] border border-black text-black">
                      Age: {calculatedAge} years old
                    </span>
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-mono shadow-[2px_2px_0px_0px_#000] focus:bg-[#FFE600]/10 focus:outline-none"
                  />
                </div>

                {/* Biological Sex */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Female', 'Male', 'Other'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSex(option)}
                        className={`py-2 px-3 border-2 border-black font-mono font-bold text-xs transition-all cursor-pointer ${
                          sex === option
                            ? 'bg-black text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]'
                            : 'bg-white hover:bg-black/5 text-black shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blood Type */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Blood Type
                  </label>
                  <select
                    value={bloodType}
                    onChange={e => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-mono shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Care Physician */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Primary Attending Physician
                  </label>
                  <input
                    type="text"
                    value={primaryPhysician}
                    onChange={e => setPrimaryPhysician(e.target.value)}
                    placeholder="e.g. Dr. Aris Thorne, MD (Cardiology)"
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-display shadow-[2px_2px_0px_0px_#000] focus:bg-[#FFE600]/10 focus:outline-none"
                  />
                </div>

                {/* Baseline Monitoring Status */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Clinical Monitoring Baseline
                  </label>
                  <select
                    value={baselineStatus}
                    onChange={e => setBaselineStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-mono shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
                  >
                    <option value="Needs Clinician Review">Needs Clinician Review (Alert Tier 2)</option>
                    <option value="Active Monitoring">Active Monitoring (Telemetry Active)</option>
                    <option value="Healthy Baseline">Healthy Baseline (Standard Surveillance)</option>
                    <option value="Stable Follow-Up">Stable Follow-Up</option>
                  </select>
                </div>
              </div>

              {/* Summary Demographics Callout */}
              <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-start space-x-3">
                <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <p className="text-xs text-black font-mono leading-relaxed">
                  Modifying demographics immediately cascades into patient age calculations, telemetry bounds, EHR export representations, and virtual doctor consultation persona calibration.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE CONDITIONS */}
          {activeTab === 'conditions' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Add Custom Condition Input */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Add Active Condition / Diagnosis
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCondition(newCondition);
                      }
                    }}
                    placeholder="Enter condition name (e.g. Heart Failure with Preserved EF)..."
                    className="flex-1 px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-display shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCondition(newCondition)}
                    className="px-4 py-2 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>

              {/* Current Conditions Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Active Conditions ({conditions.length})
                </label>
                {conditions.length === 0 ? (
                  <p className="text-xs text-black/60 font-mono italic p-3 bg-black/5 border border-dashed border-black">
                    No active conditions listed. Select suggestions below or enter custom diagnoses.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((cond, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-display font-extrabold text-black"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{cond}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          className="hover:bg-black hover:text-white p-0.5 rounded-xs transition-colors cursor-pointer"
                          title="Remove condition"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add Suggestions */}
              <div className="space-y-2 pt-2 border-t-2 border-black/10">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick-Add Common Diagnoses & Phenotypes:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CONDITIONS.map((cond, idx) => {
                    const isAdded = conditions.includes(cond);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddCondition(cond)}
                        disabled={isAdded}
                        className={`text-xs font-mono px-2.5 py-1 border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-black/5 text-black/40 border-black/20 cursor-not-allowed'
                            : 'bg-white hover:bg-[#FFE600] text-black border-black font-bold shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        {isAdded ? '✓ Added' : `+ ${cond}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICATIONS */}
          {activeTab === 'medications' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Add Custom Medication Input */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Add Active Prescription / Regimen
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMedication}
                    onChange={e => setNewMedication(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMedication(newMedication);
                      }
                    }}
                    placeholder="Enter drug name and dose (e.g. Empagliflozin 10mg)..."
                    className="flex-1 px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-display shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddMedication(newMedication)}
                    className="px-4 py-2 bg-[#CCFF00] hover:bg-[#BBEE00] text-black border-2 border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>

              {/* Current Prescriptions Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Current Regimen ({medications.length})
                </label>
                {medications.length === 0 ? (
                  <p className="text-xs text-black/60 font-mono italic p-3 bg-black/5 border border-dashed border-black">
                    No active prescriptions recorded.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-display font-extrabold text-black"
                      >
                        <Pill className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{med}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="hover:bg-black hover:text-white p-0.5 rounded-xs transition-colors cursor-pointer"
                          title="Remove prescription"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add Prescriptions */}
              <div className="space-y-2 pt-2 border-t-2 border-black/10">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Quick-Add Guideline-Directed Regimens:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_MEDICATIONS.map((med, idx) => {
                    const isAdded = medications.includes(med);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddMedication(med)}
                        disabled={isAdded}
                        className={`text-xs font-mono px-2.5 py-1 border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-black/5 text-black/40 border-black/20 cursor-not-allowed'
                            : 'bg-white hover:bg-[#CCFF00] text-black border-black font-bold shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        {isAdded ? '✓ Added' : `+ ${med}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALLERGIES */}
          {activeTab === 'allergies' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Add Custom Allergy Input */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Add Known Allergy / Severe Reaction
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={e => setNewAllergy(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergy(newAllergy);
                      }
                    }}
                    placeholder="Enter allergen and reaction (e.g. Penicillin - Hives)..."
                    className="flex-1 px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-display shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAllergy(newAllergy)}
                    className="px-4 py-2 bg-[#FF70A6] hover:bg-[#FF5A96] text-black border-2 border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>

              {/* Current Allergies Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                  Recorded Allergies & Intolerances ({allergies.length})
                </label>
                {allergies.length === 0 ? (
                  <p className="text-xs text-black/60 font-mono italic p-3 bg-black/5 border border-dashed border-black">
                    No allergies reported (NKDA).
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((allg, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#FFF0F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-display font-extrabold text-[#991B1B]"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{allg}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(idx)}
                          className="hover:bg-black hover:text-white p-0.5 rounded-xs transition-colors cursor-pointer text-black"
                          title="Remove allergy"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add Allergies */}
              <div className="space-y-2 pt-2 border-t-2 border-black/10">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Quick-Add High-Risk Drug Allergens:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ALLERGIES.map((allg, idx) => {
                    const isAdded = allergies.includes(allg);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddAllergy(allg)}
                        disabled={isAdded}
                        className={`text-xs font-mono px-2.5 py-1 border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-black/5 text-black/40 border-black/20 cursor-not-allowed'
                            : 'bg-white hover:bg-[#FF70A6] text-black border-black font-bold shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        {isAdded ? '✓ Added' : `+ ${allg}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES & EMERGENCY */}
          {activeTab === 'preferences' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preferred Language */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={e => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-mono shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
                  >
                    {['English', 'Spanish (Español)', 'Mandarin (中文)', 'Hindi (हिन्दी)', 'French (Français)', 'Arabic (العربية)', 'German (Deutsch)', 'Tagalog'].map(lang => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Communication Preference */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Notification & Communication Channel
                  </label>
                  <select
                    value={communicationPref}
                    onChange={e => setCommunicationPref(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-mono shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
                  >
                    <option value="SMS & Mobile App">SMS & Mobile App Push</option>
                    <option value="Email & SMS">Email & SMS</option>
                    <option value="Phone Calls Only">Phone Calls Only (Urgent)</option>
                    <option value="In-Portal Only">In-Portal Messages Only</option>
                  </select>
                </div>

                {/* Emergency Contact Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Thomas Vance (Son / Healthcare Proxy)"
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-display shadow-[2px_2px_0px_0px_#000] focus:bg-[#FFE600]/10 focus:outline-none"
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={e => setEmergencyContactPhone(e.target.value)}
                    placeholder="e.g. (555) 234-8901"
                    className="w-full px-3 py-2 bg-white border-2 border-black text-sm font-bold text-black font-mono shadow-[2px_2px_0px_0px_#000] focus:bg-[#FFE600]/10 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Summary Bar */}
        <div className="bg-[#FAF8F5] border-t-2 border-black px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-mono">
          <div className="flex items-center space-x-2 text-black/80 font-bold overflow-hidden">
            <span className="font-black text-black uppercase">Active Record:</span>
            <span className="truncate max-w-xs sm:max-w-md">
              {fullName || 'Unnamed'} • {calculatedAge}y/{sex[0]} • {bloodType} • {conditions.length} Conditions • {medications.length} Meds • {allergies.length} Allergies
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] font-bold text-black/70 hover:text-black flex items-center space-x-1 cursor-pointer underline hover:no-underline"
            title="Reset to default Eleanor Vance clinical benchmark data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Eleanor Vance Defaults</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t-3 border-black p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 bg-white hover:bg-black/5 text-black border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#FFE600] hover:bg-[#FFD600] text-black border-2 border-black font-mono font-black text-xs shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? 'SAVING CHANGES...' : 'SAVE PATIENT DATA & PROFILE'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
