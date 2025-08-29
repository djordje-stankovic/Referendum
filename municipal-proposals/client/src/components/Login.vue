<template>
  <div class="login-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <v-icon icon="mdi-shield-account" size="80" color="white" class="mb-6" />
        <h1 class="hero-title">Welcome Back</h1>
        <p class="hero-subtitle">Sign in to continue contributing to your community</p>
      </div>
    </div>

    <!-- Login Form -->
    <div class="form-container">
      <v-card class="login-card" elevation="12" rounded="xl">
        <v-card-title class="text-center pa-6 pb-4">
          <v-icon icon="mdi-login" size="32" color="primary" class="mb-3" />
          <h2 class="text-h4 font-weight-bold text-primary">Sign In</h2>
        </v-card-title>
        
        <v-divider class="mx-6 mb-6" />
        
        <v-card-text class="pa-6 pt-0">
          <v-form ref="form" v-model="valid" @submit.prevent="login">
            <!-- Email Field -->
            <v-text-field
              v-model="email"
              label="Email Address"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              rounded="lg"
              :rules="[v => /.+@.+\..+/.test(v) || 'Please enter a valid email address']"
              required
              class="mb-4"
            />

            <!-- Password Field -->
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              rounded="lg"
              :rules="[v => !!v || 'Password is required']"
              required
              class="mb-6"
            />

            <!-- Remember Me & Forgot Password -->
            <div class="d-flex justify-space-between align-center mb-6">
              <v-checkbox
                v-model="rememberMe"
                label="Remember me"
                color="primary"
                hide-details
              />
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="forgotPassword"
              >
                Forgot Password?
              </v-btn>
            </div>

            <!-- Login Button -->
            <v-btn
              :disabled="!valid || loading"
              color="primary"
              type="submit"
              block
              size="large"
              rounded="lg"
              elevation="4"
              class="login-btn mb-4"
              :loading="loading"
            >
              <v-icon icon="mdi-login" class="mr-2" />
              {{ loading ? 'Signing In...' : 'Sign In' }}
            </v-btn>

            <!-- Divider -->
            <div class="text-center mb-4">
              <v-divider class="my-2" />
              <span class="text-caption text-medium-emphasis">or</span>
              <v-divider class="my-2" />
            </div>

            <!-- Register Link -->
            <div class="text-center">
              <span class="text-body-2 text-medium-emphasis">Don't have an account? </span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="$router.push('/register')"
                class="font-weight-medium"
              >
                Sign Up
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const store = useAuthStore();
const router = useRouter();
const form = ref(null);
const valid = ref(false);
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);

const login = async () => {
  if (!form.value.validate()) return;
  
  loading.value = true;
  try {
    await store.loginUser({
      email: email.value,
      password: password.value,
    });
    
    // Show success message
    // You can add a toast notification here
    
    await router.push('/'); // Redirect to home page
  } catch (error) {
    console.error('Login error:', error);
    // You can add better error handling here
    alert('Login failed. Please check your credentials.');
  } finally {
    loading.value = false;
  }
};

const forgotPassword = () => {
  // Implement forgot password functionality
  alert('Forgot password functionality coming soon!');
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-btn {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%) !important;
  color: white !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .hero-section {
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .form-container {
    padding: 1rem;
  }
  
  .login-card {
    margin: 0 1rem;
  }
}

/* Animation for form appearance */
.login-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects for interactive elements */
.v-text-field:hover {
  transform: translateY(-1px);
}

.v-btn:hover {
  transform: translateY(-1px);
}
</style>