"use client";

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Resource, 
  Action, 
  type PermissionContext,
  UserPermissionContext,
  PermissionResult,
  UsePermissionsReturn
} from '@/types/rbac';

interface PermissionContextType extends UsePermissionsReturn {
  // Additional context-specific methods
  isAdmin: boolean;
  isDoctor: boolean;
  isNurse: boolean;
  isReceptionist: boolean;
  isStaff: boolean;
  
  // Quick access methods
  canManageUsers: boolean;
  canAccessReports: boolean;
  canManageSystem: boolean;
  
  // Emergency mode
  isEmergencyMode: boolean;
  enableEmergencyMode: () => void;
  disableEmergencyMode: () => void;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

interface PermissionProviderProps {
  children: ReactNode;
  enableDebugMode?: boolean;
  enableAuditLogging?: boolean;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  enableDebugMode = process.env.NODE_ENV === 'development',
  enableAuditLogging = true
}) => {
  const permissions = usePermissions();
  const [isEmergencyMode, setIsEmergencyMode] = React.useState(false);

  // Role-based quick access
  const isAdmin = useMemo(() => permissions.user?.role === 'ADMIN', [permissions.user?.role]);
  const isDoctor = useMemo(() => permissions.user?.role === 'DOCTOR', [permissions.user?.role]);
  const isNurse = useMemo(() => permissions.user?.role === 'NURSE', [permissions.user?.role]);
  const isReceptionist = useMemo(() => permissions.user?.role === 'RECEPTIONIST', [permissions.user?.role]);
  const isStaff = useMemo(() => permissions.user?.role === 'STAFF', [permissions.user?.role]);

  // Quick access methods
  const canManageUsers = useMemo(() => 
    permissions.canAccess('staff', 'manage'), [permissions.canAccess]
  );
  
  const canAccessReports = useMemo(() => 
    permissions.canAccess('reports', 'read'), [permissions.canAccess]
  );
  
  const canManageSystem = useMemo(() => 
    permissions.canAccess('system', 'manage'), [permissions.canAccess]
  );

  // Emergency mode handlers
  const enableEmergencyMode = React.useCallback(() => {
    setIsEmergencyMode(true);
    if (enableAuditLogging) {
      console.log('🚨 Emergency mode enabled for user:', permissions.user?.role);
    }
  }, [permissions.user?.role, enableAuditLogging]);

  const disableEmergencyMode = React.useCallback(() => {
    setIsEmergencyMode(false);
    if (enableAuditLogging) {
      console.log('✅ Emergency mode disabled for user:', permissions.user?.role);
    }
  }, [permissions.user?.role, enableAuditLogging]);

  // Enhanced permission checking with emergency mode
  const enhancedCanAccess = React.useCallback((
    resource: Resource,
    action: Action,
    context?: PermissionContext
  ): boolean => {
    if (isEmergencyMode) {
      return permissions.hasEmergencyAccess(resource, action);
    }
    return permissions.canAccess(resource, action, context);
  }, [isEmergencyMode, permissions.canAccess, permissions.hasEmergencyAccess]);

  // Enhanced permission checking with audit logging
  const enhancedHasPermission = React.useCallback((
    resource: Resource,
    action: Action,
    context?: PermissionContext
  ): boolean => {
    const result = enhancedCanAccess(resource, action, context);
    
    if (enableAuditLogging && permissions.user) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: permissions.user.userId,
        role: permissions.user.role,
        resource,
        action,
        context,
        result,
        emergencyMode: isEmergencyMode
      };
      
      // In a real app, this would be sent to an audit service
      console.log('📋 Permission Audit:', logEntry);
    }
    
    return result;
  }, [enhancedCanAccess, enableAuditLogging, permissions.user, isEmergencyMode]);

  // Debug mode enhanced permission checking
  const debugCanAccess = React.useCallback((
    resource: Resource,
    action: Action,
    context?: PermissionContext
  ): boolean => {
    if (enableDebugMode) {
      permissions.debugPermission(resource, action, context);
    }
    
    return enhancedHasPermission(resource, action, context);
  }, [enableDebugMode, permissions.debugPermission, enhancedHasPermission]);

  const contextValue: PermissionContextType = useMemo(() => ({
    ...permissions,
    
    // Override with enhanced methods
    canAccess: debugCanAccess,
    hasPermission: enhancedHasPermission,
    
    // Role-based quick access
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    isStaff,
    
    // Quick access methods
    canManageUsers,
    canAccessReports,
    canManageSystem,
    
    // Emergency mode
    isEmergencyMode,
    enableEmergencyMode,
    disableEmergencyMode
  }), [
    permissions,
    debugCanAccess,
    enhancedHasPermission,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    isStaff,
    canManageUsers,
    canAccessReports,
    canManageSystem,
    isEmergencyMode,
    enableEmergencyMode,
    disableEmergencyMode
  ]);

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Hook to use the permission context
 */
export const usePermissionContext = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  
  return context;
};

/**
 * Hook for role-based conditional rendering
 */
export const useRoleAccess = () => {
  const { isAdmin, isDoctor, isNurse, isReceptionist, isStaff } = usePermissionContext();
  
  return {
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    isStaff,
    
    // Role combinations
    isMedicalStaff: isDoctor || isNurse,
    isAdministrative: isAdmin || isReceptionist,
    isClinical: isDoctor || isNurse || isAdmin,
    isSupport: isReceptionist || isStaff,
    
    // Role hierarchy checks
    canManageDoctors: isAdmin,
    canManageNurses: isAdmin || isDoctor,
    canManageReceptionists: isAdmin || isDoctor,
    canManageStaff: isAdmin || isDoctor || isNurse
  };
};

/**
 * Hook for emergency mode management
 */
export const useEmergencyMode = () => {
  const { 
    isEmergencyMode, 
    enableEmergencyMode, 
    disableEmergencyMode,
    hasEmergencyAccess 
  } = usePermissionContext();
  
  return {
    isEmergencyMode,
    enableEmergencyMode,
    disableEmergencyMode,
    hasEmergencyAccess
  };
};

/**
 * Hook for audit logging
 */
export const usePermissionAudit = () => {
  const { user } = usePermissionContext();
  
  const logPermissionCheck = React.useCallback((
    resource: Resource,
    action: Action,
    context: PermissionContext | undefined,
    result: boolean,
    additionalData?: Record<string, any>
  ) => {
    if (!user) return;
    
    const auditEntry = {
      id: crypto.randomUUID(),
      userId: user.userId,
      role: user.role,
      resource,
      action,
      context,
      result,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      additionalData
    };
    
    // In a real app, this would be sent to an audit service
    console.log('📋 Permission Audit Entry:', auditEntry);
    
    return auditEntry;
  }, [user]);
  
  return {
    logPermissionCheck
  };
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermissions = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  requiredPermissions: {
    resource: Resource;
    action: Action;
    context?: PermissionContext;
  }[]
) => {
  return React.forwardRef<unknown, P>((props, ref) => {
    const { canAccess } = usePermissionContext();
    
    const hasAllPermissions = requiredPermissions.every(({ resource, action, context }) =>
      canAccess(resource, action, context)
    );
    
    if (!hasAllPermissions) {
      return null;
    }
    
    return <Component {...(props as P)} />;
  });
};

/**
 * Component for permission-based conditional rendering
 */
export const PermissionGate: React.FC<{
  resource: Resource;
  action: Action;
  context?: PermissionContext;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  showFallback?: boolean;
}> = ({ 
  resource, 
  action, 
  context, 
  fallback, 
  children, 
  showFallback = false 
}) => {
  const { canAccess } = usePermissionContext();
  
  const hasAccess = canAccess(resource, action, context);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (showFallback && fallback) {
    return <>{fallback}</>;
  }
  
  return null;
};

/**
 * Component for role-based conditional rendering
 */
export const RoleGate: React.FC<{
  roles: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  showFallback?: boolean;
}> = ({ roles, fallback, children, showFallback = false }) => {
  const { user } = usePermissionContext();
  
  const hasRole = user && roles.includes(user.role);
  
  if (hasRole) {
    return <>{children}</>;
  }
  
  if (showFallback && fallback) {
    return <>{fallback}</>;
  }
  
  return null;
};
