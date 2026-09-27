import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, X, Sparkles, Stethoscope } from 'lucide-react';
import { subscribeToWorkflowEvents } from '../services/apiClient';

interface LiveNotification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  title: string;
  message: string;
  timestamp: string;
}

export const NotificationBanner: React.FC = () => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToWorkflowEvents((eventType, data) => {
      let notif: LiveNotification | null = null;
      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (eventType === 'CLINICIAN_DECISION_RECORDED') {
        notif = {
          id,
          type: 'SUCCESS',
          title: 'Care Plan Updated by Attending Physician',
          message: data?.message || 'Dr. Thorne has signed your updated care plan in the clinical ledger.',
          timestamp
        };
      } else if (eventType === 'TASK_STATUS_CHANGED') {
        notif = {
          id,
          type: 'INFO',
          title: 'Monitoring Task Updated',
          message: `Task status updated in your longitudinal daily tracker.`,
          timestamp
        };
      } else if (eventType === 'JOB_ENQUEUED') {
        notif = {
          id,
          type: 'INFO',
          title: 'Background Clinical Analysis',
          message: `Task ${data?.jobType || 'Processing'} enqueued in clinical worker pool.`,
          timestamp
        };
      } else if (eventType === 'VIRTUAL_DOCTOR_ESCALATION') {
        notif = {
          id,
          type: 'ALERT',
          title: 'Clinical Escalation Triggered',
          message: data?.escalationDetails?.reason || 'Urgent clinical handoff dispatched to attending team.',
          timestamp
        };
      }

      if (notif) {
        setNotifications(prev => [notif!, ...prev.slice(0, 3)]);

        // Auto dismiss after 6 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 6000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-12 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 flex items-start justify-between gap-3 ${
            notif.type === 'ALERT'
              ? 'bg-rose-50/95 border-rose-300 text-rose-950'
              : notif.type === 'SUCCESS'
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
              : 'bg-slate-900/95 border-slate-700 text-white'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {notif.type === 'ALERT' ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : notif.type === 'SUCCESS' ? (
                <Stethoscope className="w-4 h-4 text-emerald-600" />
              ) : (
                <Bell className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold block">{notif.title}</span>
                <span className="text-[10px] opacity-60 font-mono">{notif.timestamp}</span>
              </div>
              <p className="text-xs opacity-90 mt-0.5 leading-snug">{notif.message}</p>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(notif.id)}
            className="opacity-60 hover:opacity-100 p-1 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
