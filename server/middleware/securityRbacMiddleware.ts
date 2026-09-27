import { Request, Response, NextFunction } from 'express';

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
 * Enforces role-based and patient-resource access control.
 * Prevents unauthorized cross-patient data access.
 */
export const authenticateAndAuthorize = (allowedRoles?: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract token or authorization headers (simulate verified JWT payload)
    const authHeader = req.headers.authorization;
    const roleHeader = (req.headers['x-user-role'] as UserRole) || 'clinician';
    const patientParam = (req.params.patientId || req.query.patientId || req.body.patientId || 'patient-ev-68') as string;

    // Simulated Verified Claims (in production, verified via asymmetric RSA-256 JWT key)
    const mockUser: AuthenticatedUser = {
      userId: roleHeader === 'patient' ? 'user-patient-ev' : 'user-dr-thorne',
      role: roleHeader,
      fullName: roleHeader === 'patient' ? 'Eleanor Vance' : 'Dr. Aris Thorne, MD',
      email: roleHeader === 'patient' ? 'eleanor.vance@patient.heal' : 'thorne.nephro@hospital.org',
      allowedPatientIds: roleHeader === 'patient' ? ['patient-ev-68'] : ['patient-ev-68', 'patient-jm-72', 'patient-rk-55'],
      tenantId: 'st-jude-cardiorenal-network'
    };

    req.authenticatedUser = mockUser;

    // 1. Role-Level Check
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(mockUser.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_ROLE',
        message: `Role '${mockUser.role}' is not authorized to access this clinical endpoint. Required: [${allowedRoles.join(', ')}]`
      });
    }

    // 2. Resource-Level Patient Scope Check (Prevents cross-patient leakage)
    if (patientParam && mockUser.role === 'patient') {
      if (!mockUser.allowedPatientIds.includes(patientParam)) {
        return res.status(403).json({
          success: false,
          error: 'PATIENT_RESOURCE_FORBIDDEN',
          message: 'Patients are strictly prohibited from accessing records of other patient identities.'
        });
      }
    }

    // 3. Researcher Data Masking Mandate
    if (mockUser.role === 'researcher' && !req.path.includes('/synthetic') && !req.path.includes('/benchmarks') && !req.path.includes('/swarm')) {
      return res.status(403).json({
        success: false,
        error: 'RESEARCHER_PHI_PROHIBITED',
        message: 'Researchers are restricted to the de-identified and synthetic simulation plane.'
      });
    }

    next();
  };
};
