import axios from 'axios';

// ─── Role Configuration ───────────────────────────────────────────────────────
// Each key maps to a portal. loginApi, redirectUrl, and tokenKeys are derived
// from env vars so they work across dev / test / prod without code changes.
export const roleConfig = {
  student: {
    name: 'Student',
    label: 'Continue learning',
    icon: '🎓',
    loginApi: `${process.env.NEXT_PUBLIC_LOGIN_URL}/login`,
    getDashboardRoute: (data) => {
      return `/student/dashboard?token=${encodeURIComponent(data.token)}&sId=${encodeURIComponent(data.userID)}`;
    },
    type: 'student',
    // Token storage strategy: localStorage token + sId, plus httpOnly session cookie
    storeTokens: (data) => {
      if (typeof window === 'undefined') return;
      if (data.token) window.localStorage.setItem('token', data.token);
      if (data.userID) window.localStorage.setItem('sId', data.userID);
      // Also set a plain cookie for cross-tab reads by the student middleware
      if (data.token) document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    },
    postLoginHook: async (data) => {
      try {
        // Pre-fetch permissions cookie on login to prevent middleware redirection loop
        await axios.get('/api/auth/refresh?json=true');
      } catch (err) {
        console.error('Failed to pre-fetch permissions:', err);
      }
    },
    clearTokens: () => {
      if (typeof window === 'undefined') return;
      ['token', 'sId'].forEach(k => window.localStorage.removeItem(k));
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },
  },

  tpo: {
    name: 'College',
    label: 'Manage placements',
    icon: '🏫',
    loginApi: `${process.env.NEXT_PUBLIC_LOGIN_URL}/login`,
    getDashboardRoute: (data) => {
      return `/tpo/dashboard?token=${encodeURIComponent(data.token)}&userId=${encodeURIComponent(data.userID)}`;
    },
    type: 'college',
    storeTokens: (data) => {
      if (typeof window === 'undefined') return;
      if (data.token) window.localStorage.setItem('token', data.token);
      if (data.userID) window.localStorage.setItem('userId', data.userID);
      if (data.token) document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    },
    postLoginHook: null,
    clearTokens: () => {
      if (typeof window === 'undefined') return;
      ['token', 'userId'].forEach(k => window.localStorage.removeItem(k));
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },
  },


  company: {
    name: 'Organization',
    label: 'Post jobs & hire talent',
    icon: '🏢',
    loginApi: `${process.env.NEXT_PUBLIC_LOGIN_URL}/login`,
    getDashboardRoute: (data) => {
      return `/company/myjobs?token=${encodeURIComponent(data.token)}`;
    },
    type: 'company',
    storeTokens: (data) => {
      if (typeof window === 'undefined') return;
      if (data.token) window.localStorage.setItem('token', data.token);
      if (data.token) document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    },
    postLoginHook: null,
    clearTokens: () => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },
  },
};

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Login for a given role. Returns { success: true, redirectUrl } on success.
   * Throws an error with a user-friendly message on failure.
  */
  loginByRole: async (role, email, password) => {
    // debugger;
    const config = roleConfig[role];
    if (!config) throw new Error('Invalid portal selected');

    let response;
    try {
      response = await axios.post(config.loginApi, {
        email: email.trim().toLowerCase(),
        password
      });
    } catch (err) {
      // Extract detailed message from backend if available
      const backendMsg = err.response?.data?.message || err.response?.data?.err || err.message;
      throw new Error(backendMsg);
    }

    const data = response.data;
    // Validate: admin returns cryptoToken; all others return token
    const hasToken = data?.token || data?.cryptoToken;
    if (!hasToken) {
      throw new Error(data?.err || data?.message || 'Authentication failed. Please check your credentials.');
    }

    const typeToRoleKey = {
      student: 'student',
      tpo: 'tpo',
      college: 'tpo',
      company: 'company',
      users: 'student',
    };
    const resolvedRole = typeToRoleKey[data?.type] || role;
    const resolvedConfig = roleConfig[resolvedRole] || config;

    // 1. Store tokens in localStorage + plain cookie
    resolvedConfig.storeTokens(data);

    // 2. Call any portal-specific session hook (e.g. httpOnly cookie endpoints)
    if (resolvedConfig.postLoginHook) {
      await resolvedConfig.postLoginHook(data);
    }

    const redirectUrl = resolvedConfig.getDashboardRoute(data);

    return { success: true, redirectUrl, resolvedRole };
  },

  /**
   * Forgot password — sends reset email via the student/user API.
   * Works for student + TPO portals (others not supported by backend).
   */
  forgotPassword: async (role, email) => {
    const config = roleConfig[role];
    if (!config) throw new Error('Invalid portal selected');

    // Only student portal has a forgot-password endpoint currently
    const forgotUrl = `${process.env.NEXT_PUBLIC_GQL_URL}/forgotStudentPassword`;
    await axios.post(forgotUrl, {
      email: email.trim().toLowerCase(),
      type: config.type,
    });
  },
};
