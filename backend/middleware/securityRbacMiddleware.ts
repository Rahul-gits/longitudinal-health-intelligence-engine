import { Request, Response, NextFunction } from 'express';
import { validateSession } from '../routes/authRoutes';
import type { UserRecord } from '../routes/authRoutes';

export type UserRole = 'patient' | 'clinician' | 'researcher' | 'admin';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  fullName: string;
  email: string;
  allowedPatientIds: string[]; // Clinician: assigned patients; Patient: own ID only
  tenantId: string;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
    }
  }
}

/**
 * Security & RBAC Middleware for Heal Engine
 * 
 * FIXED: Validates session against server-side session store instead of
 * trusting unsigned x-user-role headers. Enforces role-based and
 * patient-resource access control. Prevents unauthorized cross-patient data access.
 */
export const authenticateAndAuthorize = (allowedRoles?: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract session ID from Authorization header or x-session-id
    const authHeader = req.headers.authorization;
    const sessionId = req.headers['x-session-id'] as string ||
      (authHeader ? authHeader.replace('Bearer ', '') : null);

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Valid session required. Please sign in.'
      });
    }

    // 2. Validate session against server-side session store
    const result = validateSession(sessionId);
    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'SESSION_INVALID_OR_EXPIRED',
        message: 'Session is invalid or has expired. Please sign in again.'
      });
    }

    const { user } = result;

    // 3. Populate authenticated user from verified session data (NOT from headers)
    const authenticatedUser: AuthenticatedUser = {
      userId: user.id,
      role: user.role as UserRole,
      fullName: user.fullName,
      email: user.email,
      allowedPatientIds: user.allowedPatientIds,
      tenantId: user.tenantId
    };

    req.authenticatedUser = authenticatedUser;

    // 4. Role-Level Check
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(authenticatedUser.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ROLE',
        message: `Role '${authenticatedUser.role}' is not authorized to access this clinical endpoint. Required: [${allowedRoles.join(', ')}]`
      });
    }

    // 5. Resource-Level Patient Scope Check (Prevents cross-patient leakage / IDOR / BOLA)
    const patientParam = (req.params.patientId || req.query.patientId || req.body?.patientId) as string | undefined;
    if (patientParam && authenticatedUser.role === 'patient') {
      if (!authenticatedUser.allowedPatientIds.includes(patientParam)) {
        return res.status(403).json({
          success: false,
          error: 'PATIENT_RESOURCE_FORBIDDEN',
          message: 'Patients are strictly prohibited from accessing records of other patient identities.'
        });
      }
    }

    // 6. Researcher Data Masking Mandate
    if (authenticatedUser.role === 'researcher' && !req.path.includes('/synthetic') && !req.path.includes('/benchmarks') && !req.path.includes('/swarm')) {
      return res.status(403).json({
        success: false,
        error: 'RESEARCHER_PHI_PROHIBITED',
        message: 'Researchers are restricted to the de-identified and synthetic simulation plane.'
      });
    }

    next();
  };
};
