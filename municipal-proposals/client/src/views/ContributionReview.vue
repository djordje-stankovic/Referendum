<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Header -->
        <div class="d-flex align-center mb-6">
          <v-btn 
            icon 
            variant="text" 
            @click="goBack"
            class="mr-4"
          >
            <v-icon size="24">mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Review Contribution</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Review changes proposed by {{ contribution?.first_name }} {{ contribution?.last_name }}
            </p>
          </div>
        </div>

        <!-- Contribution Info Card -->
        <v-card class="mb-6" elevation="2">
          <v-card-title class="text-h6 font-weight-medium pa-4">
            <v-icon class="mr-2" color="info">mdi-information</v-icon>
            Contribution Details
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-4">
              <v-avatar size="48" class="mr-3">
                <v-img :src="getUserAvatar(contribution?.user_id)"></v-img>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-medium">
                  {{ contribution?.first_name }} {{ contribution?.last_name }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Proposed changes on {{ formatDate(contribution?.created_at) }}
                </div>
              </div>
            </div>
            
            <div class="d-flex gap-2">
              <v-chip 
                v-if="contribution?.field_name === 'multiple_fields'"
                color="warning" 
                variant="tonal"
              >
                Multiple fields
              </v-chip>
              <v-chip 
                v-else
                color="info" 
                variant="tonal"
              >
                {{ contribution?.field_name }}
              </v-chip>
              <v-chip color="warning" variant="tonal">
                Pending Review
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Changes Comparison -->
        <v-card class="mb-6" elevation="2">
          <v-card-title class="text-h6 font-weight-medium pa-4">
            <v-icon class="mr-2" color="primary">mdi-compare</v-icon>
            Changes Comparison
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="contribution?.field_name === 'multiple_fields'">
              <!-- Multiple Fields Comparison - Only show changed fields -->
              <div class="changes-grid">
                <div 
                  class="change-item" 
                  v-for="(change, field) in changedFieldsOnly" 
                  :key="field"
                >
                  <div class="field-header">
                    <h3 class="text-subtitle-1 font-weight-medium text-capitalize">{{ formatFieldName(field) }}</h3>
                  </div>
                  
                  <div class="comparison-row">
                    <div class="old-value">
                      <div class="label">Current Value</div>
                      <div class="value">{{ getOldValue(field) || 'Empty' }}</div>
                    </div>
                    <div class="arrow">
                      <v-icon color="primary" size="20">mdi-arrow-right</v-icon>
                    </div>
                    <div class="new-value">
                      <div class="label">Proposed Value</div>
                      <div class="value">{{ change || 'Empty' }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Show message if no changes -->
              <div v-if="Object.keys(changedFieldsOnly).length === 0" class="text-center py-8">
                <v-icon size="48" color="grey-lighten-1">mdi-information</v-icon>
                <p class="text-h6 text-medium-emphasis mt-4">No changes detected</p>
                <p class="text-body-2 text-medium-emphasis">All values remain the same</p>
              </div>
            </div>
            <div v-else>
              <!-- Single Field Comparison -->
              <div class="comparison-row">
                <div class="old-value">
                  <div class="label">Current Value</div>
                  <div class="value">{{ contribution?.old_value || 'Empty' }}</div>
                </div>
                <div class="arrow">
                  <v-icon color="primary" size="20">mdi-arrow-right</v-icon>
                </div>
                <div class="new-value">
                  <div class="label">Proposed Value</div>
                  <div class="value">{{ contribution?.new_value || 'Empty' }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Reason for Change -->
        <v-card class="mb-6" elevation="2" v-if="contribution?.edit_summary">
          <v-card-title class="text-h6 font-weight-medium pa-4">
            <v-icon class="mr-2" color="info">mdi-comment-text</v-icon>
            Reason for Change
          </v-card-title>
          <v-card-text class="pa-4">
            <p class="text-body-1">{{ contribution.edit_summary }}</p>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <v-card elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex gap-3 justify-end">
              <v-btn 
                color="error" 
                size="large"
                prepend-icon="mdi-close"
                @click="rejectContribution"
                :loading="loading"
                variant="outlined"
              >
                REJECT
              </v-btn>
              <v-btn 
                color="success" 
                size="large"
                prepend-icon="mdi-check"
                @click="approveContribution"
                :loading="loading"
              >
                APPROVE
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const contribution = ref(null);
const loading = ref(false);

// Parse JSON changes for multiple fields
const parsedChanges = computed(() => {
  if (!contribution.value?.new_value) return {};
  try {
    return JSON.parse(contribution.value.new_value);
  } catch (e) {
    return {};
  }
});

// Get old value for a specific field
const getOldValue = (field) => {
  if (!contribution.value?.old_value) return 'Empty';
  try {
    const oldData = JSON.parse(contribution.value.old_value);
    const value = oldData[field];
    // Return actual value or 'Empty' if it's truly empty/null/undefined
    if (value === null || value === undefined || value === '') {
      return 'Empty';
    }
    return value;
  } catch (e) {
    console.error('Error parsing old_value:', e);
    return 'Empty';
  }
};

// Identify fields that have changed
const changedFieldsOnly = computed(() => {
  const oldData = JSON.parse(contribution.value?.old_value || '{}');
  const newData = JSON.parse(contribution.value?.new_value || '{}');
  const changedFields = {};

  for (const field in newData) {
    if (oldData[field] !== newData[field]) {
      changedFields[field] = newData[field];
    }
  }
  return changedFields;
});

// Format field name for display
const formatFieldName = (field) => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Fetch contribution details
const fetchContribution = async () => {
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions/${route.params.contributionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch contribution');
    }
    const data = await response.json();
    contribution.value = data;
  } catch (error) {
    console.error('Error fetching contribution:', error);
  }
};

// Approve contribution
const approveContribution = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions/${route.params.contributionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'approved',
        userId: authStore.currentUser?.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to approve contribution');
    }

    alert('Contribution approved successfully!');
    goBack();
  } catch (error) {
    console.error('Error approving contribution:', error);
    alert('Error approving contribution. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Reject contribution
const rejectContribution = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${route.params.id}/contributions/${route.params.contributionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'rejected',
        userId: authStore.currentUser?.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to reject contribution');
    }

    alert('Contribution rejected successfully!');
    goBack();
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    alert('Error rejecting contribution. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Go back to proposal view
const goBack = () => {
  router.go(-1);
};

// Get user avatar
const getUserAvatar = (userId) => {
  // Default avatar logic
  return `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchContribution();
});
</script>

<style scoped>
.changes-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.change-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.field-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.old-value, .new-value {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  min-height: 80px;
}

.old-value {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.new-value {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 8px;
}

.value {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  word-break: break-word;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 50%;
  border: 1px solid #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .comparison-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .arrow {
    transform: rotate(90deg);
  }
}
</style>
