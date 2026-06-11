import { useSelector } from "react-redux";
import { useMemo, useState, useEffect } from "react";

// General action permissions
export const PERMISSION_VALUES = {
  DELETE: "delete",
  CREATE: "create",
  EDIT: "edit",
  PUBLISH: "publish",
  MANAGE_USERS: "manage_users",
};

// Section/Route permissions
export const SECTION_PERMISSIONS = {
  COURSE: "course",
  INTERNSHIP: "internship",
  PRACTICE: "practice",
  SKILL: "skill",
};

// Permission messages for general actions
export const PERMISSION_MESSAGES = {
  [PERMISSION_VALUES.DELETE]: "You don't have permission to delete",
  [PERMISSION_VALUES.CREATE]: "You don't have permission to create",
  [PERMISSION_VALUES.EDIT]: "You don't have permission to edit",
  [PERMISSION_VALUES.PUBLISH]: "You don't have permission to publish",
  [PERMISSION_VALUES.MANAGE_USERS]: "You don't have permission to manage users",
};

// Section permission messages
export const SECTION_MESSAGES = {
  [SECTION_PERMISSIONS.COURSE]: "You don't have access to Course Library",
  [SECTION_PERMISSIONS.INTERNSHIP]:
    "You don't have access to Internship Library",
  [SECTION_PERMISSIONS.PRACTICE]: "You don't have access to Practice Questions",
  [SECTION_PERMISSIONS.SKILL]: "You don't have access to Skill Library",
};

export const usePermissions = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { value, loading } = useSelector((state) => state.adminAuth?.user || {});
  const currentUser = isMounted ? (value?.user || value || null) : null;
  const permissions = currentUser?.permissions || {};

  // Check if user can access any of the provided actions/sections
  const canAccess = useMemo(
    () =>
      (...actions) => {
        if (!permissions || !actions.length) return false;
        return actions.some((action) => !!permissions[action]);
      },
    [permissions]
  );

  // Check if user has all of the provided actions/sections
  const accessAll = useMemo(
    () =>
      (...actions) => {
        if (!permissions || !actions.length) return false;
        return actions.every((action) => !!permissions[action]);
      },
    [permissions]
  );

  // Check if user has access to a specific section
  const canAccessSection = useMemo(
    () => (section) => {
      return !!permissions[section];
    },
    [permissions]
  );

  // Check if user has a general permission (create, edit, delete, etc.)
  const hasPermission = useMemo(
    () => (permission) => {
      return !!permissions[permission];
    },
    [permissions]
  );

  // Get permission message for an action or section
  const getPermissionMessage = useMemo(
    () => (action) => {
      // Check if it's a general permission
      if (PERMISSION_MESSAGES[action]) {
        return PERMISSION_MESSAGES[action];
      }
      // Check if it's a section permission
      if (SECTION_MESSAGES[action]) {
        return SECTION_MESSAGES[action];
      }
      // Default message
      return `You don't have permission to ${action}`;
    },
    []
  );

  // Get section access message
  const getSectionMessage = useMemo(
    () => (section) => {
      return SECTION_MESSAGES[section] || `You don't have access to ${section}`;
    },
    []
  );

  // Check if user has specific role
  const hasRole = useMemo(
    () => (role) => {
      return currentUser?.role?.toLowerCase() === role?.toLowerCase();
    },
    [currentUser?.role]
  );

  // Check if user is admin
  const isAdmin = useMemo(
    () => currentUser?.role?.toLowerCase() === "admin",
    [currentUser?.role]
  );

  // Check if user is moderator
  const isModerator = useMemo(
    () => currentUser?.role?.toLowerCase() === "moderator",
    [currentUser?.role]
  );

  // Check if user is viewer
  const isViewer = useMemo(
    () => currentUser?.role?.toLowerCase() === "viewer",
    [currentUser?.role]
  );

  // Get list of sections user has access to
  const accessibleSections = useMemo(() => {
    return Object.values(SECTION_PERMISSIONS).filter(
      (section) => !!permissions[section]
    );
  }, [permissions]);

  // Get list of general permissions user has
  const activePermissions = useMemo(() => {
    return Object.values(PERMISSION_VALUES).filter(
      (permission) => !!permissions[permission]
    );
  }, [permissions]);

  // Check if user has any permissions at all
  const hasAnyPermission = useMemo(() => {
    return Object.keys(permissions).some((key) => permissions[key] === true);
  }, [permissions]);

  return {
    // Core permission checks
    canAccess,
    accessAll,
    hasPermission,
    canAccessSection,

    // Permission messages
    getPermissionMessage,
    getSectionMessage,

    // Role checks
    hasRole,
    isAdmin,
    isModerator,
    isViewer,

    // Permission lists
    accessibleSections,
    activePermissions,
    hasAnyPermission,

    // User data
    loading,
    permissions,
    role: currentUser?.role || null,
    user: currentUser,

    // Constants
    PERMISSION_VALUES,
    SECTION_PERMISSIONS,
    PERMISSION_MESSAGES,
    SECTION_MESSAGES,
  };
};
