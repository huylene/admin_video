/**
 * Authentication Module (Supabase Auth & Profile Data)
 */

window.auth = {
  _cachedProfile: null,

  // Get active session
  async getCurrentSession() {
    if (!window.sb) return null;
    try {
      const { data: { session }, error } = await window.sb.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.warn('Error getting session:', err);
      return null;
    }
  },

  // Get current user object
  async getCurrentUser() {
    const session = await this.getCurrentSession();
    return session ? session.user : null;
  },

  // Get current user profile with role
  async getCurrentProfile(forceRefresh = false) {
    if (this._cachedProfile && !forceRefresh) {
      return this._cachedProfile;
    }

    const user = await this.getCurrentUser();
    if (!user) {
      this._cachedProfile = null;
      return null;
    }

    try {
      const { data, error } = await window.sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Error loading user profile:', error.message);
        // Fallback default profile if trigger has delay
        this._cachedProfile = {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email.split('@')[0],
          role: 'USER',
          avatar_url: null
        };
        return this._cachedProfile;
      }

      this._cachedProfile = data;
      return data;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  },

  // Sign In
  async signIn(email, password) {
    if (!window.sb) throw new Error('Supabase client chưa được khởi tạo');
    const { data, error } = await window.sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    this._cachedProfile = null;
    return data;
  },

  // Sign Up (Role is always USER on public signup)
  async signUp(username, email, password) {
    if (!window.sb) throw new Error('Supabase client chưa được khởi tạo');
    const { data, error } = await window.sb.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          username: username.trim()
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign Out
  async signOut() {
    if (window.sb) {
      try {
        await window.sb.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    this._cachedProfile = null;
    window.location.href = 'login.html';
  },

  // Password Recovery Request
  async requestPasswordReset(email) {
    if (!window.sb) throw new Error('Supabase client chưa được khởi tạo');
    const redirectUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, 'reset-password.html');
    const { data, error } = await window.sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });

    if (error) throw error;
    return data;
  },

  // Update Password
  async updatePassword(newPassword) {
    if (!window.sb) throw new Error('Supabase client chưa được khởi tạo');
    const { data, error } = await window.sb.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  // Update Profile
  async updateProfile(updates) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Chưa đăng nhập');

    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    this._cachedProfile = data;
    return data;
  }
};
