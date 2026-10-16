import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

interface FormState {
  name: string;
  email: string;
  organization: string;
  role: string;
  subject: string;
  message: string;
  honeypot: string; // Anti-spam field
}

interface ValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type SubmissionStatus = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR';

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    organization: '',
    role: 'clinician',
    subject: '',
    message: '',
    honeypot: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [ticketId, setTicketId] = useState<string>('');

  const validateForm = (): boolean => {
    const errs: ValidationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please provide your name (at least 2 characters).';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Name cannot exceed 100 characters.';
    }

    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters.';
    } else if (formData.subject.trim().length > 200) {
      errs.subject = 'Subject cannot exceed 200 characters.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    } else if (formData.message.trim().length > 3000) {
      errs.message = 'Message cannot exceed 3,000 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('SUBMITTING');
    setStatusMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => null);

      if (res.status === 429) {
        setStatus('ERROR');
        setStatusMessage(data?.error || 'Rate limit exceeded. Please wait 10 minutes before submitting another inquiry.');
        return;
      }

      if (res.ok && data?.success) {
        setStatus('SUCCESS');
        setTicketId(data.ticketId || '');
        setStatusMessage(data.message || 'Inquiry successfully transmitted.');
        // Reset form fields
        setFormData({
          name: '',
          email: '',
          organization: '',
          role: 'clinician',
          subject: '',
          message: '',
          honeypot: ''
        });
      } else if (data?.code === 'EMAIL_SERVICE_NOT_CONFIGURED') {
        // Honest notification: Email service provider is not configured in this environment
        setStatus('NOT_CONFIGURED');
        setTicketId(data.ticketId || '');
        setStatusMessage(data.guidance || 'Email provider credentials (CONTACT_SMTP_HOST or CONTACT_WEBHOOK_URL) are not set in environment secrets.');
      } else {
        setStatus('ERROR');
        setStatusMessage(data?.error || 'Failed to submit inquiry. Please try again or contact us via telephone.');
      }
    } catch (err: any) {
      setStatus('ERROR');
      setStatusMessage('Network connection error. Please verify backend connectivity.');
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#080808] font-sans pb-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Contact & Support', path: '/contact' }
        ]}
        onNavigate={onNavigate}
      />

      <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#FFE45C] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-[#080808] shadow-[2px_2px_0px_#000]">
            <Mail className="w-3.5 h-3.5" />
            <span>CLINICAL COMMUNICATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#080808]">
            Contact Clinical Engineering &amp; Support
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            Reach out to our clinical engineering team, request hospital integration pilots, or report security and clinical questions.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Form Card */}
          <div className="lg:col-span-7 bg-white border-2 border-[#080808] shadow-[8px_8px_0px_#000] p-6 sm:p-10 space-y-6">
            <h2 className="text-2xl font-display font-bold text-[#080808]">
              Send an Inquiry
            </h2>

            {/* Status Alerts */}
            {status === 'SUCCESS' && (
              <div role="alert" className="p-4 bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>INQUIRY TRANSMITTED SUCCESSFULLY</span>
                </div>
                <p>{statusMessage}</p>
                {ticketId && <p className="font-bold">Ticket Tracking ID: {ticketId}</p>}
              </div>
            )}

            {status === 'NOT_CONFIGURED' && (
              <div role="alert" className="p-4 bg-[#FFFBEB] border-2 border-[#F59E0B] text-[#92400E] space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Info className="w-4 h-4 text-[#F59E0B]" />
                  <span>INQUIRY AUDITED · EMAIL PROVIDER SETUP NOTICE</span>
                </div>
                <p>
                  Your message has been captured in the secure forensic inquiry ledger (Ticket: <strong className="font-bold">{ticketId}</strong>).
                </p>
                <p className="text-[11px] text-[#78350F]">
                  <strong>Provider Setup Requirement:</strong> {statusMessage}
                </p>
              </div>
            )}

            {status === 'ERROR' && (
              <div role="alert" className="p-4 bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                  <span>SUBMISSION ERROR</span>
                </div>
                <p>{statusMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Anti-spam honeypot (hidden from real users) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-honeypot">Leave blank</label>
                <input
                  id="contact-honeypot"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                />
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                    Your Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.name ? 'border-[#EF4444]' : 'border-[#080808]'} rounded-none text-sm text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]`}
                    placeholder="Dr. Jordan Hayes"
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="text-xs text-[#EF4444] font-mono mt-1" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                    Work Email <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.email ? 'border-[#EF4444]' : 'border-[#080808]'} rounded-none text-sm text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]`}
                    placeholder="jordan.hayes@hospital.org"
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="text-xs text-[#EF4444] font-mono mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Organization & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-org" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                    Hospital / Institution
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-[#080808] rounded-none text-sm text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]"
                    placeholder="Metro Health Health System"
                  />
                </div>

                <div>
                  <label htmlFor="contact-role" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                    Professional Role
                  </label>
                  <select
                    id="contact-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-[#080808] rounded-none text-sm text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]"
                  >
                    <option value="clinician">Attending Clinician / Specialist</option>
                    <option value="hospital_admin">Hospital Administrator / CIO</option>
                    <option value="health_it">Health IT / FHIR Engineer</option>
                    <option value="researcher">Clinical Researcher</option>
                    <option value="patient">Patient / Caregiver</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#080808] mb-1.5">
                  Subject <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.subject ? 'border-[#EF4444]' : 'border-[#080808]'} rounded-none text-sm text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]`}
                  placeholder="Cardiorenal Decision Support Pilot Deployment"
                />
                {errors.subject && (
                  <p id="contact-subject-error" className="text-xs text-[#EF4444] font-mono mt-1" role="alert">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="contact-message" className="block text-xs font-mono font-bold uppercase tracking-wider text-[#080808]">
                    Message <span className="text-[#EF4444]">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {formData.message.length} / 3000 chars
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.message ? 'border-[#EF4444]' : 'border-[#080808]'} rounded-none text-sm text-[#080808] focus:outline-none focus:ring-2 focus:ring-[#FFE45C]`}
                  placeholder="Please describe your hospital integration environment, EHR platform (Epic, Cerner), or clinical inquiry..."
                ></textarea>
                {errors.message && (
                  <p id="contact-message-error" className="text-xs text-[#EF4444] font-mono mt-1" role="alert">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={status === 'SUBMITTING'}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#FFE45C] text-[#080808] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#080808] shadow-[4px_4px_0px_#000] hover:bg-white transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'SUBMITTING' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Inquiry…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Clinical Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Details & Telephone Side Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#090E17] text-white border-2 border-[#080808] shadow-[8px_8px_0px_#000] p-6 sm:p-8 space-y-6">
              <span className="text-[10px] font-mono font-bold bg-[#FFE45C] text-[#080808] px-2 py-0.5 border border-[#080808]">
                DIRECT CHANNELS
              </span>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Clinical Telemetry &amp; Operations
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-[#0F172A] border border-[#334155] space-y-1">
                  <div className="flex items-center gap-2 text-[#FFE45C] font-bold">
                    <Phone className="w-4 h-4" />
                    <span>EMERGENCY TELEHEALTH HOTLINE</span>
                  </div>
                  <a href="tel:+18005554325" className="text-sm font-bold text-white hover:underline block pt-1">
                    1-800-555-HEAL (+1-800-555-4325)
                  </a>
                  <p className="text-[11px] text-[#94A3B8]">
                    Available 24/7 for acute inpatient cardiorenal monitoring support.
                  </p>
                </div>

                <div className="p-3 bg-[#0F172A] border border-[#334155] space-y-1">
                  <div className="flex items-center gap-2 text-[#2DD4BF] font-bold">
                    <Mail className="w-4 h-4" />
                    <span>DATA PROTECTION OFFICER</span>
                  </div>
                  <a href="mailto:dpo@healengine.hospital.org" className="text-sm font-bold text-white hover:underline block pt-1">
                    dpo@healengine.hospital.org
                  </a>
                  <p className="text-[11px] text-[#94A3B8]">
                    Inquiries regarding HIPAA, DPDP Act 2023, and immutable audit trails.
                  </p>
                </div>

                <div className="p-3 bg-[#0F172A] border border-[#334155] space-y-1">
                  <div className="flex items-center gap-2 text-[#A78BFA] font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>HEADQUARTERS &amp; LABS</span>
                  </div>
                  <p className="text-white pt-1">
                    HEAL Health Systems Clinical Intelligence Labs<br />
                    Cardiorenal &amp; Digital Health Research Center
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time Guarantee Box */}
            <div className="bg-white border-2 border-[#080808] shadow-[4px_4px_0px_#000] p-6 space-y-2 text-xs font-mono">
              <span className="font-bold text-[#080808] uppercase">Clinical Response SLA</span>
              <p className="text-[#475569]">
                Critical care telemetry queries are reviewed within 1 hour. General institutional integration requests receive an architectural response within 1 business day.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
