<template>
  <div class="settings-page">
    <v-container class="py-6">
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-6">
            <h1 class="text-h3 font-weight-bold text-primary mb-2">
              <v-icon size="48" color="primary" class="mr-3">mdi-account-cog</v-icon>
              User Settings
            </h1>
            <p class="text-h6 text-medium-emphasis">
              Manage your profile, password, and preferences
            </p>
          </div>
          
          <UserSettings />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import UserSettings from '@/components/UserSettings.vue';

// Set page title
document.title = 'Settings - Municipal Proposals';
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.v-container {
  max-width: 1200px;
}
</style>


