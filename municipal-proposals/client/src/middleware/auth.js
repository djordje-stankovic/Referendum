// middleware/auth.js
import { useAuthStore } from '@/stores/auth';

export function requireAuth(to, from, next) {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated()) {
    // User is not authenticated, redirect to login
    next('/login');
  } else {
    // User is authenticated, allow access
    next();
  }
}

export function requireGuest(to, from, next) {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated()) {
    // User is already authenticated, redirect to home
    next('/');
  } else {
    // User is not authenticated, allow access to login/register
    next();
  }
}
