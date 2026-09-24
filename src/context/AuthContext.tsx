import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  loginApi,
  registerApi,
  verifyOtpApi,
  submitConsentApi,
  submitProfileSetupApi,
  checkSessionApi,
  logoutApi,
  getStoredUser
} from '../services/authApi';

export type AuthState =
  | 'AUTH_LOADING'
  | 'UNAUTHENTICATED'
  | 'EMAIL_UNVERIFIED'
  | 'CONSENT_REQUIRED'
  | 'PROFILE_INCOMPLETE'
  | 'AUTHENTICATED';

export type AuthView =
  | 'login'
  | 'register'
  | 'otp'
  | 'forgot_password'
  | 'consent'
  | 'profile_setup';

interface AuthContextType {
  authState: AuthState;
  authView: AuthView;
  user: AuthUser | null;
  activeEmail: string;
  demoOtp: string | null;
  error: string | null;
  isLoading: boolean;
  setAuthView: (view: AuthView) => void;
  setError: (err: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  submitConsent: (terms: boolean, privacy: boolean) => Promise<boolean>;
  submitProfile: (data: {
    dob: string;
    sex: string;
    preferredLanguage: string;
    communicationPref: string;
    conditions: string[];
    medications: string[];
    allergies: string[];
    hasUploadedRecords: boolean;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  demoLoginAs: (role: 'eleanor' | 'rahul') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('AUTH_LOADING');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeEmail, setActiveEmail] = useState<string>('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const evaluateUserState = (u: AuthUser | null): AuthState => {
    if (!u) return 'UNAUTHENTICATED';
    if (!u.emailVerified) return 'EMAIL_UNVERIFIED';
    if (!u.consentAccepted) return 'CONSENT_REQUIRED';
    if (!u.profileCompleted) return 'PROFILE_INCOMPLETE';
    return 'AUTHENTICATED';
  };

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await checkSessionApi();
        if (session.authenticated && session.user) {
          setUser(session.user);
          setActiveEmail(session.user.email);
          setAuthState(evaluateUserState(session.user));
        } else {
          // If fresh session, check stored user
          const stored = getStoredUser();
          if (stored) {
            setUser(stored);
            setActiveEmail(stored.email);
            setAuthState(evaluateUserState(stored));
          } else {
            setAuthState('UNAUTHENTICATED');
          }
        }
      } catch {
        setAuthState('UNAUTHENTICATED');
      }
    };
    initSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginApi(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveEmail(res.user.email);
        const nextState = evaluateUserState(res.user);
        setAuthState(nextState);
        if (nextState === 'EMAIL_UNVERIFIED') setAuthView('otp');
        else if (nextState === 'CONSENT_REQUIRED') setAuthView('consent');
        else if (nextState === 'PROFILE_INCOMPLETE') setAuthView('profile_setup');
        return true;
      } else {
        setError(res.error || 'Unable to sign in. Check your email and password and try again.');
        return false;
      }
    } catch {
      setError('Unable to sign in. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await registerApi(fullName, email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveEmail(res.user.email);
        setDemoOtp(res.demoOtp || '428193');
        setAuthState('EMAIL_UNVERIFIED');
        setAuthView('otp');
        return true;
      } else {
        setError(res.error || 'Registration failed.');
        return false;
      }
    } catch {
      setError('Registration encountered an error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyOtpApi(activeEmail, otp);
      if (res.success) {
        if (user) {
          const updated = { ...user, emailVerified: true };
          setUser(updated);
          const nextState = evaluateUserState(updated);
          setAuthState(nextState);
          if (nextState === 'CONSENT_REQUIRED') setAuthView('consent');
          else if (nextState === 'PROFILE_INCOMPLETE') setAuthView('profile_setup');
        } else {
          setAuthState('CONSENT_REQUIRED');
          setAuthView('consent');
        }
        return true;
      } else {
        setError(res.error || 'Invalid verification code.');
        return false;
      }
    } catch {
      setError('Verification failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitConsent = async (terms: boolean, privacy: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await submitConsentApi(activeEmail, terms, privacy);
      if (res.success) {
        if (user) {
          const updated = { ...user, consentAccepted: true };
          setUser(updated);
          const nextState = evaluateUserState(updated);
          setAuthState(nextState);
          if (nextState === 'PROFILE_INCOMPLETE') setAuthView('profile_setup');
        } else {
          setAuthState('PROFILE_INCOMPLETE');
          setAuthView('profile_setup');
        }
        return true;
      } else {
        setError(res.error || 'Consent could not be registered.');
        return false;
      }
    } catch {
      setError('An error occurred during consent registration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitProfile = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await submitProfileSetupApi({ email: activeEmail, ...data });
      if (res.success) {
        if (user) {
          const updated = { ...user, profileCompleted: true, profile: data };
          setUser(updated);
        }
        setAuthState('AUTHENTICATED');
        return true;
      } else {
        setError(res.error || 'Failed to complete profile.');
        return false;
      }
    } catch {
      setAuthState('AUTHENTICATED');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } finally {
      setUser(null);
      setActiveEmail('');
      setAuthState('UNAUTHENTICATED');
      setAuthView('login');
      setIsLoading(false);
    }
  };

  const demoLoginAs = async (role: 'eleanor' | 'rahul') => {
    if (role === 'eleanor') {
      await login('eleanor@example.com', 'password123');
    } else {
      await login('rahul@example.com', 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        authView,
        user,
        activeEmail,
        demoOtp,
        error,
        isLoading,
        setAuthView,
        setError,
        login,
        register,
        verifyOtp,
        submitConsent,
        submitProfile,
        logout,
        demoLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
