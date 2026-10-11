import React from 'react';
import { AlertTriangle, Home, ShieldAlert, ArrowLeft, Phone, Mail } from 'lucide-react';

interface NotFoundRecoveryWorkspaceProps {
  onNavigateTab: (tab: string) => void;
  onTriggerEmergency?: () => void;
  attemptedRoute?: string;
}

export const NotFoundRecoveryWorkspace: React.FC<NotFoundRecoveryWorkspaceProps> = ({
  onNavigateTab,
  onTriggerEmergency,
  attemptedRoute
}) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in" role="region" aria-label="Route Not Found Recovery">
      <div
        className="p-8 sm:p-10 border-2"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: '6px 6px 0 var(--border)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 flex items-center justify-center font-bold"
            style={{ background: '#FFE45C', border: '2px solid var(--border)', color: '#080808' }}
          >
            <AlertTriangle className="w-6 h-6 text-amber-700" aria-hidden="true" />
          </div>
          <div>
            <span className="he-badge !bg-amber-100 !text-amber-900 border-amber-400">404 CLINICAL ROUTE NOTICE</span>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight mt-1" style={{ color: 'var(--text-ink)' }}>
              Clinical Workspace Not Found
            </h1>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
          The requested workspace tab or clinical view {attemptedRoute ? <code className="px-1.5 py-0.5 font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded">{attemptedRoute}</code> : 'requested'} could not be resolved or is not accessible under your current clinical role session.
        </p>

        <div
          className="p-4 mb-6 border-l-4"
          style={{ background: 'var(--bg-paper)', borderColor: '#0D9488' }}
        >
          <p className="text-xs font-mono font-medium" style={{ color: 'var(--text-ink)' }}>
            ✓ Patient records and active clinical workflows remain securely preserved in memory. No session data was compromised.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('command')}
            className="he-btn flex items-center gap-2 !px-5 !py-2.5 !text-xs font-bold"
            style={{ background: '#FFE45C', color: '#080808' }}
            aria-label="Return to Primary Clinical Dashboard"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="he-btn-ghost flex items-center gap-2 !px-4 !py-2.5 !text-xs font-semibold"
            aria-label="View Patient Records and Labs"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>View Records &amp; Labs</span>
          </button>

          {onTriggerEmergency && (
            <button
              onClick={onTriggerEmergency}
              className="he-btn-danger flex items-center gap-2 !px-4 !py-2.5 !text-xs ml-auto"
              aria-label="Trigger Emergency Protocol"
            >
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
              <span>Urgent Assistance</span>
            </button>
          )}
        </div>

        {/* Clinical Desk Contact */}
        <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono" style={{ borderColor: 'var(--rule)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <span>Clinical Helpdesk:</span>
            <a
              href="tel:+18005554325"
              className="font-bold hover:underline inline-flex items-center gap-1"
              style={{ color: '#0D9488' }}
              aria-label="Call Clinical Helpdesk at 1-800-555-4325"
            >
              <Phone className="w-3 h-3" aria-hidden="true" />
              1-800-555-HEAL
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>Governance Support:</span>
            <a
              href="mailto:support@healengine.hospital.org"
              className="font-bold hover:underline inline-flex items-center gap-1"
              style={{ color: '#0D9488' }}
              aria-label="Email Governance Support"
            >
              <Mail className="w-3 h-3" aria-hidden="true" />
              support@healengine.hospital.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
