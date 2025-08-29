<template>
  <div class="register-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <v-icon icon="mdi-account-plus" size="80" color="white" class="mb-6" />
        <h1 class="hero-title">Join Our Community</h1>
        <p class="hero-subtitle">Create an account and start making a difference in your municipality</p>
      </div>
    </div>

    <!-- Register Form -->
    <div class="form-container">
      <v-card class="register-card" elevation="12" rounded="xl">
        <v-card-title class="text-center pa-6 pb-4">
          <v-icon icon="mdi-account-plus" size="32" color="primary" class="mb-3" />
          <h2 class="text-h4 font-weight-bold text-primary">Create Account</h2>
        </v-card-title>
        
        <v-divider class="mx-6 mb-6" />
        
        <v-card-text class="pa-6 pt-0">
          <v-form ref="form" v-model="valid" @submit.prevent="register">
            <!-- Name Fields -->
            <div class="d-flex gap-4 mb-4">
              <v-text-field
                v-model="firstName"
                label="First Name"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                rounded="lg"
                :rules="[v => !!v || 'First name is required']"
                required
                class="flex-grow-1"
              />
              <v-text-field
                v-model="lastName"
                label="Last Name"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                rounded="lg"
                :rules="[v => !!v || 'Last name is required']"
                required
                class="flex-grow-1"
              />
            </div>

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
              :rules="[
                v => !!v || 'Password is required',
                v => v.length >= 6 || 'Password must be at least 6 characters'
              ]"
              required
              class="mb-4"
            />

            <!-- Municipality Selection -->
            <v-select
              v-if="municipalities && municipalities.length > 0"
              v-model="municipalityId"
              :items="municipalities"
              item-title="name"
              item-value="id"
              label="Select Your Municipality"
              prepend-inner-icon="mdi-map-marker"
              variant="outlined"
              rounded="lg"
              :rules="[v => !!v || 'Please select your municipality']"
              required
              class="mb-6"
            />
            <div v-else class="text-center py-4">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
              />
              <p class="text-body-2 text-medium-emphasis mt-2">Loading municipalities...</p>
            </div>

            <!-- Terms and Conditions -->
            <div class="d-flex align-center mb-6">
              <v-checkbox
                v-model="acceptTerms"
                color="primary"
                hide-details
                required
              />
              <span class="text-body-2 ml-2">
                I agree to the 
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="showTerms = true"
                  class="font-weight-medium pa-0"
                >
                  Terms and Conditions
                </v-btn>
              </span>
            </div>

            <!-- Register Button -->
            <v-btn
              :disabled="!valid || !acceptTerms || loading"
              color="primary"
              type="submit"
              block
              size="large"
              rounded="lg"
              elevation="4"
              class="register-btn mb-4"
              :loading="loading"
            >
              <v-icon icon="mdi-account-plus" class="mr-2" />
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </v-btn>

            <!-- Divider -->
            <div class="text-center mb-4">
              <v-divider class="my-2" />
              <span class="text-caption text-medium-emphasis">or</span>
              <v-divider class="my-2" />
            </div>

            <!-- Login Link -->
            <div class="text-center">
              <span class="text-body-2 text-medium-emphasis">Already have an account? </span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                @click="$router.push('/login')"
                class="font-weight-medium"
              >
                Sign In
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Terms Dialog -->
    <v-dialog v-model="showTerms" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-file-document" class="mr-3" color="primary" />
          Terms and Conditions
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showTerms = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            By using this platform, you agree to:
          </p>
          <ul class="text-body-1">
            <li>Provide accurate and truthful information</li>
            <li>Respect other users and their contributions</li>
            <li>Follow community guidelines and local regulations</li>
            <li>Use the platform for legitimate civic engagement purposes</li>
          </ul>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const store = useAuthStore();
const router = useRouter();
const form = ref(null);
const valid = ref(false);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const municipalityId = ref(null);
const acceptTerms = ref(false);
const loading = ref(false);
const showTerms = ref(false);

const municipalities = computed(() => store.municipalities || []);

onMounted(() => {
  store.fetchMunicipalities();
});

const register = async () => {
  if (!form.value.validate() || !acceptTerms.value) return;
  
  loading.value = true;
  try {
    await store.registerUser({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
      municipality_id: municipalityId.value,
    });
    
    // Show success message
    alert('Registration successful! Please log in with your new account.');
    await router.push('/login');
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  position: relative;
  overflow: hidden;
}

.register-container::before {
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

.register-card {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-btn {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
  color: white !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .register-container {
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
  
  .register-card {
    margin: 0 1rem;
  }
  
  .d-flex.gap-4 {
    flex-direction: column;
    gap: 0 !important;
  }
}

/* Animation for form appearance */
.register-card {
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
.v-text-field:hover,
.v-select:hover {
  transform: translateY(-1px);
}

.v-btn:hover {
  transform: translateY(-1px);
}
</style>