<template>
  <div class="user-settings">
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon class="mr-2" color="primary">mdi-account-cog</v-icon>
        User Settings
      </v-card-title>
      
      <v-card-text>
        <v-tabs v-model="activeTab" class="mb-6">
          <v-tab value="profile" prepend-icon="mdi-account">
            Profile
          </v-tab>
          <v-tab value="password" prepend-icon="mdi-lock">
            Change Password
          </v-tab>
          <v-tab value="preferences" prepend-icon="mdi-cog">
            Preferences
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Profile Tab -->
          <v-window-item value="profile">
            <v-form @submit.prevent="updateProfile" ref="profileForm">
              <v-row>
                <!-- Avatar Section - Redesigned -->
                <v-col cols="12" class="mb-6">
                  <v-card variant="outlined" class="pa-6 text-center avatar-card">
                    <div class="avatar-container">
                      <!-- Current Avatar Display -->
                      <div class="current-avatar-section mb-4">
                        <v-avatar size="120" class="avatar-main">
                          <v-img 
                            :src="getCurrentAvatarUrl()" 
                            alt="User Avatar"
                            cover
                          >
                            <template v-slot:placeholder>
                              <v-icon size="48" color="grey-lighten-2">mdi-account</v-icon>
                            </template>
                          </v-img>
                        </v-avatar>
                        
                        <!-- Avatar Info -->
                        <div class="avatar-info mt-3">
                          <v-chip 
                            :color="profileData.avatar ? 'success' : 'warning'" 
                            variant="outlined"
                            size="small"
                          >
                            <v-icon start size="16">
                              {{ profileData.avatar ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                            </v-icon>
                            {{ profileData.avatar ? 'Avatar Set' : 'No Avatar' }}
                          </v-chip>
                        </div>
                      </div>
                      
                      <!-- Avatar Actions -->
                      <div class="avatar-actions">
                        <!-- File Input with Validation -->
                        <v-file-input
                          v-model="avatarFile"
                          accept="image/*"
                          label="Choose New Avatar Image"
                          variant="outlined"
                          density="compact"
                          prepend-icon="mdi-camera"
                          hide-details
                          class="avatar-upload"
                          style="max-width: 250px;"
                          @change="handleAvatarChange"
                          :error-messages="avatarError"
                          :rules="avatarValidationRules"
                        ></v-file-input>
                        
                        <!-- Avatar Preview -->
                        <div v-if="avatarPreview" class="avatar-preview mt-4">
                          <v-card variant="outlined" class="pa-3 preview-card">
                            <div class="text-caption text-medium-emphasis mb-2">Preview:</div>
                            <v-avatar size="80" class="preview-avatar">
                              <v-img 
                                :src="avatarPreview" 
                                alt="Avatar Preview"
                                cover
                              ></v-img>
                            </v-avatar>
                            <div class="text-caption text-success mt-2">
                              <v-icon size="16" color="success">mdi-check-circle</v-icon>
                              Image selected successfully
                            </div>
                          </v-card>
                        </div>
                        
                        <!-- Upload Button -->
                        <v-btn
                          v-if="avatarFile && !avatarError"
                          @click="uploadAvatar"
                          color="primary"
                          size="small"
                          class="mt-3"
                          :loading="avatarLoading"
                          prepend-icon="mdi-upload"
                          variant="elevated"
                        >
                          Upload New Avatar
                        </v-btn>
                        
                        <!-- Error Display -->
                        <div v-if="avatarError" class="avatar-error mt-3">
                          <v-alert
                            type="error"
                            variant="tonal"
                            density="compact"
                            class="text-caption"
                          >
                            <v-icon start size="16">mdi-alert-circle</v-icon>
                            {{ avatarError }}
                          </v-alert>
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-col>
                
                <!-- Profile Fields -->
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-6">
                    <v-card-title class="text-h6 font-weight-medium mb-4">
                      <v-icon class="mr-2" color="primary">mdi-account-edit</v-icon>
                      Personal Information
                    </v-card-title>
                    
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profileData.first_name"
                          label="First Name"
                          variant="outlined"
                          required
                          :rules="[v => !!v || 'First name is required']"
                          prepend-inner-icon="mdi-account"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profileData.last_name"
                          label="Last Name"
                          variant="outlined"
                          required
                          :rules="[v => !!v || 'Last name is required']"
                          prepend-inner-icon="mdi-account"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profileData.email"
                          label="Email Address"
                          type="email"
                          variant="outlined"
                          required
                          :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                          prepend-inner-icon="mdi-email"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profileData.username"
                          label="Username"
                          variant="outlined"
                          required
                          :rules="[v => !!v || 'Username is required']"
                          prepend-inner-icon="mdi-account-key"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="profileData.bio"
                          label="About Me"
                          variant="outlined"
                          rows="4"
                          placeholder="Tell us about yourself, your interests, or what you'd like to contribute to the community..."
                          prepend-inner-icon="mdi-text"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    
                    <div class="text-center mt-6">
                      <v-btn
                        type="submit"
                        color="primary"
                        size="large"
                        :loading="loading"
                        prepend-icon="mdi-content-save"
                        variant="elevated"
                        class="px-8"
                      >
                        Save Profile Changes
                      </v-btn>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-window-item>

          <!-- Password Tab -->
          <v-window-item value="password">
            <v-form @submit.prevent="changePassword" ref="passwordForm">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.currentPassword"
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    required
                    :rules="[v => !!v || 'Current password is required']"
                    prepend-inner-icon="mdi-lock"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.newPassword"
                    label="New Password"
                    type="password"
                    variant="outlined"
                    required
                    :rules="[
                      v => !!v || 'New password is required',
                      v => v.length >= 8 || 'Password must be at least 8 characters',
                      v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
                      v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
                      v => /[0-9]/.test(v) || 'Password must contain at least one number'
                    ]"
                    prepend-inner-icon="mdi-lock-plus"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    required
                    :rules="[
                      v => !!v || 'Please confirm your password',
                      v => v === passwordData.newPassword || 'Passwords do not match'
                    ]"
                    prepend-inner-icon="mdi-lock-check"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    color="warning"
                    size="large"
                    :loading="loading"
                    prepend-icon="mdi-lock-reset"
                  >
                    Change Password
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-window-item>

          <!-- Preferences Tab -->
          <v-window-item value="preferences">
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <v-card-title class="text-h6">
                    <v-icon class="mr-2" color="info">mdi-bell</v-icon>
                    Notifications
                  </v-card-title>
                  <v-card-text>
                    <v-switch
                      v-model="preferences.emailNotifications"
                      label="Email Notifications"
                      color="primary"
                    ></v-switch>
                    <v-switch
                      v-model="preferences.pushNotifications"
                      label="Push Notifications"
                      color="primary"
                    ></v-switch>
                    <v-switch
                      v-model="preferences.proposalUpdates"
                      label="Proposal Updates"
                      color="primary"
                    ></v-switch>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <v-card-title class="text-h6">
                    <v-icon class="mr-2" color="success">mdi-eye</v-icon>
                    Privacy
                  </v-card-title>
                  <v-card-text>
                    <v-switch
                      v-model="preferences.publicProfile"
                      label="Public Profile"
                      color="primary"
                    ></v-switch>
                    <v-switch
                      v-model="preferences.showEmail"
                      label="Show Email to Others"
                      color="primary"
                    ></v-switch>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-btn
                  @click="savePreferences"
                  color="success"
                  size="large"
                  :loading="loading"
                  prepend-icon="mdi-content-save"
                >
                  Save Preferences
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSuccess = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showError = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const activeTab = ref('profile');
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Profile data
const profileData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  bio: '',
  avatar: null, // New field for avatar URL
  user_id: null // New field for user ID
});

// Password data
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Preferences
const preferences = reactive({
  emailNotifications: true,
  pushNotifications: true,
  proposalUpdates: true,
  publicProfile: true,
  showEmail: false
});

// Avatar upload state
const avatarFile = ref(null);
const avatarLoading = ref(false);
const avatarPreview = ref(null); // New ref for avatar preview
const avatarError = ref(''); // New ref for avatar error messages

// Validation rules for avatar file input
const avatarValidationRules = [
  (value) => {
    if (!value) return true; // Allow empty value
    if (value.size > 5 * 1024 * 1024) return 'Avatar must be less than 5MB';
    if (value.size < 1024) return 'Avatar must be larger than 1KB';
    if (!value.type || !value.type.startsWith('image/')) return 'Avatar must be an image';
    return true;
  }
];

// Load user data on mount
onMounted(() => {
  if (authStore.currentUser) {
    profileData.first_name = authStore.currentUser.first_name || '';
    profileData.last_name = authStore.currentUser.last_name || '';
    profileData.email = authStore.currentUser.email || '';
    profileData.username = authStore.currentUser.username || '';
    profileData.bio = authStore.currentUser.bio || '';
    profileData.avatar = authStore.currentUser.avatar || null;
    profileData.user_id = authStore.currentUser.id;
  }
  loadUserAvatar(); // Call the new function here
});

// Helper to get user avatar URL from backend
const getUserAvatar = async (userId) => {
  try {
    const response = await fetch(`${authStore.baseUrl}/api/users/${userId}/avatar`);
    if (response.ok) {
      const data = await response.json();
      return data.avatarUrl;
    }
  } catch (error) {
    console.error('Error fetching avatar:', error);
  }
  // Fallback to default avatar
  return `https://i.pravatar.cc/150?img=${userId % 70 + 1}`;
};

// Helper to get the current avatar URL for display
const getCurrentAvatarUrl = () => {
  if (profileData.avatar) {
    return profileData.avatar;
  }
  // Return a default avatar URL until we fetch from backend
  return profileData.user_id ? `https://i.pravatar.cc/150?img=${profileData.user_id % 70 + 1}` : '';
};

// Load user avatar on mount
const loadUserAvatar = async () => {
  if (profileData.user_id && !profileData.avatar) {
    try {
      const avatarUrl = await getUserAvatar(profileData.user_id);
      profileData.avatar = avatarUrl;
    } catch (error) {
      console.error('Failed to load avatar:', error);
    }
  }
};

// Handle avatar file input change
const handleAvatarChange = (event) => {
  avatarFile.value = event;
  avatarPreview.value = null; // Clear previous preview
  avatarError.value = ''; // Clear previous errors

  if (avatarFile.value && avatarFile.value instanceof File) {
    // Validate file
    if (avatarFile.value.size > 5 * 1024 * 1024) {
      avatarError.value = 'Avatar must be less than 5MB';
      return;
    }
    if (avatarFile.value.size < 1024) {
      avatarError.value = 'Avatar must be larger than 1KB';
      return;
    }
    if (!avatarFile.value.type.startsWith('image/')) {
      avatarError.value = 'Avatar must be an image file';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.onerror = () => {
      avatarError.value = 'Failed to read image file';
    };
    reader.readAsDataURL(avatarFile.value);
  }
};

// Upload avatar
const uploadAvatar = async () => {
  if (!avatarFile.value) return;

  const formData = new FormData();
  formData.append('avatar', avatarFile.value);

  avatarLoading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/users/${profileData.user_id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      
      // Update local state with new avatar
      profileData.avatar = data.avatarUrl;
      
      // Update auth store
      authStore.updateUser({ avatar: data.avatarUrl });
      
      // Clear file input and preview
      avatarFile.value = null;
      avatarPreview.value = null;
      
      // Show success message
      successMessage.value = 'Avatar uploaded successfully!';
      showSuccess.value = true;
      
      // Force refresh of avatar display
      await loadUserAvatar();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { userId: profileData.user_id, avatarUrl: data.avatarUrl } 
      }));
      
    } else {
      const error = await response.json();
      errorMessage.value = error.message || 'Failed to upload avatar';
      showError.value = true;
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while uploading avatar';
    showError.value = true;
  } finally {
    avatarLoading.value = false;
  }
};

// Update profile
const updateProfile = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(profileData)
    });

    if (response.ok) {
      successMessage.value = 'Profile updated successfully!';
      showSuccess.value = true;
      
      // Update auth store
      authStore.updateUser(profileData);
    } else {
      const error = await response.json();
      errorMessage.value = error.message || 'Failed to update profile';
      showError.value = true;
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while updating profile';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// Change password
const changePassword = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
    });

    if (response.ok) {
      successMessage.value = 'Password changed successfully!';
      showSuccess.value = true;
      
      // Clear password fields
      passwordData.currentPassword = '';
      passwordData.newPassword = '';
      passwordData.confirmPassword = '';
    } else {
      const error = await response.json();
      errorMessage.value = error.message || 'Failed to change password';
      showError.value = true;
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while changing password';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// Save preferences
const savePreferences = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/users/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(preferences)
    });

    if (response.ok) {
      successMessage.value = 'Preferences saved successfully!';
      showSuccess.value = true;
    } else {
      const error = await response.json();
      errorMessage.value = error.message || 'Failed to save preferences';
      showError.value = true;
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while saving preferences';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.user-settings {
  max-width: 800px;
  margin: 0 auto;
}

.v-tab {
  text-transform: none;
  font-weight: 500;
}

.v-window-item {
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.avatar-card:hover {
  transform: translateY(-5px);
}

.avatar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-main {
  border: 4px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.avatar-actions {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-upload {
  margin-bottom: 10px;
}

.current-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-info {
  margin-top: 10px;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.preview-card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.preview-card:hover {
  transform: translateY(-5px);
}

.preview-avatar {
  border: 4px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.avatar-error {
  margin-top: 10px;
}
</style>
