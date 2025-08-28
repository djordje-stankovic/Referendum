// stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    municipalities: [],
    baseUrl: 'http://localhost:3000',
  }),
  persist: {
    storage: localStorage, // Čuva u localStorage
    paths: ['currentUser'], // Perzistira samo currentUser
  },
  actions: {
    async fetchMunicipalities() {
      try {
        const res = await fetch(`${this.baseUrl}/api/municipalities`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        this.municipalities = data;
      } catch (error) {
        console.error('Error fetching municipalities:', error);
        this.municipalities = [];
      }
    },
    async registerUser(userData) {
              const response = await fetch(`${this.baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      this.currentUser = data.user;
      return data;
    },
    async loginUser(credentials) {
              const response = await fetch(`${this.baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      this.currentUser = data.user;
      console.log('Logged in user:', this.currentUser);
      
      // Dispatch event to notify other components that user has logged in
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: data.user } }));
      
      return data;
    },
    logout() {
      this.currentUser = null;
      // Clear localStorage
      localStorage.removeItem('auth');
      // Clear any other stored data
      sessionStorage.clear();
    },
    isAuthenticated() {
      return !!this.currentUser;
    },
  },
  getters: {
    userName: (state) => state.currentUser ? `${state.currentUser.first_name} ${state.currentUser.last_name}` : 'Guest',
  },
});