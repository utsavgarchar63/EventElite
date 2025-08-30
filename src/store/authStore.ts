import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    setUser(user: any) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setRole(role: string) {
      this.role = role;
      localStorage.setItem('role', role);
    },
    logout() {
      this.user = null;
      this.token = null;
      this.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('admin_id');
    }
  }
});
