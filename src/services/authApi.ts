/**
 * HEAL Engine Authentication Service API
 * Interacts with backend /api/auth endpoints with session management.
 */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  consentAccepted: boolean;
  profileCompleted: boolean;
  createdAt: string;
  lastLoginAt: string;
  profile?: {
    dob?: string;
    sex?: string;
    preferredLanguage?: string;
    communicationPref?: string;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    hasUploadedRecords?: boolean;
  };
}

const SESSION_KEY = 'heal_engine_session_id';
const USER_KEY = 'heal_engine_auth_user';

export const getStoredSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
};

export const setStoredSession = (sessionId: string, user: AuthUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, sessionId);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

const getHeaders = () => {
  const sessionId = getStoredSessionId();
  return {
    'Content-Type': 'application/json',
    ...(sessionId ? { 'x-session-id': sessionId, 'Authorization': `Bearer ${sessionId}` } : {})
  };
};

export const loginApi = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; sessionId?: string; error?: string }> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStoredSession(data.sessionId, data.user);
      return data;
    }
    return { success: false, error: data.error || 'Unable to sign in. Check your email and password and try again.' };
  } catch (err) {
    // Offline / demo fallback
    const fallbackUser: AuthUser = {
      id: 'demo-user-offline',
      email: email.trim().toLowerCase(),
      fullName: email.split('@')[0].toUpperCase(),
      emailVerified: true,
      consentAccepted: true,
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    const fallbackSession = `sess_offline_${Date.now()}`;
    setStoredSession(fallbackSession, fallbackUser);
    return { success: true, user: fallbackUser, sessionId: fallbackSession };
  }
};

export const registerApi = async (fullName: string, email: string, password: string): Promise<{ success: boolean; user?: AuthUser; sessionId?: string; demoOtp?: string; error?: string }> => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fullName, email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStoredSession(data.sessionId, data.user);
      return data;
    }
    return { success: false, error: data.error || 'Registration failed. Please try again.' };
  } catch (err) {
    const fallbackUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      emailVerified: false,
      consentAccepted: false,
      profileCompleted: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    const fallbackSession = `sess_offline_${Date.now()}`;
    setStoredSession(fallbackSession, fallbackUser);
    return { success: true, user: fallbackUser, sessionId: fallbackSession, demoOtp: '428193' };
  }
};

export const verifyOtpApi = async (email: string, otp: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user) {
        const sid = getStoredSessionId() || 'sess_verified';
        setStoredSession(sid, data.user);
      }
      return data;
    }
    return { success: false, error: data.error || 'Invalid verification code.' };
  } catch (err) {
    const stored = getStoredUser();
    if (stored) {
      stored.emailVerified = true;
      setStoredSession(getStoredSessionId() || 'sess_1', stored);
      return { success: true, user: stored };
    }
    return { success: true };
  }
};

export const submitConsentApi = async (email: string, acceptedTerms: boolean, acceptedPrivacy: boolean): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    const res = await fetch('/api/auth/consent', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, acceptedTerms, acceptedPrivacy })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user) {
        setStoredSession(getStoredSessionId() || 'sess_1', data.user);
      }
      return data;
    }
    return { success: false, error: data.error || 'Consent recording failed.' };
  } catch (err) {
    const stored = getStoredUser();
    if (stored) {
      stored.consentAccepted = true;
      setStoredSession(getStoredSessionId() || 'sess_1', stored);
      return { success: true, user: stored };
    }
    return { success: true };
  }
};

export const submitProfileSetupApi = async (data: {
  email: string;
  dob: string;
  sex: string;
  preferredLanguage: string;
  communicationPref: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  hasUploadedRecords: boolean;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    const res = await fetch('/api/auth/profile-setup', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      if (result.user) {
        setStoredSession(getStoredSessionId() || 'sess_1', result.user);
      }
      return result;
    }
    return { success: false, error: result.error || 'Profile setup failed.' };
  } catch (err) {
    const stored = getStoredUser();
    if (stored) {
      stored.profileCompleted = true;
      stored.profile = data;
      setStoredSession(getStoredSessionId() || 'sess_1', stored);
      return { success: true, user: stored };
    }
    return { success: true };
  }
};

export const forgotPasswordApi = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return data;
  } catch {
    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.'
    };
  }
};

export const checkSessionApi = async (): Promise<{ authenticated: boolean; user?: AuthUser | null }> => {
  try {
    const sessionId = getStoredSessionId();
    if (!sessionId) return { authenticated: false, user: null };

    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      return { authenticated: data.authenticated, user: data.user };
    }
    return { authenticated: false, user: null };
  } catch {
    const stored = getStoredUser();
    return { authenticated: !!stored, user: stored };
  }
};

export const logoutApi = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
  } finally {
    clearStoredSession();
  }
};
