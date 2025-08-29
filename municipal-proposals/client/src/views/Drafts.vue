<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-2">My Drafts</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Continue working on your saved proposals or convert them to final submissions
        </p>
      </div>
      
      <v-btn
        color="primary"
        variant="flat"
        :to="'/create'"
        prepend-icon="mdi-plus"
        size="large"
        elevation="2"
      >
        Create New Draft
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
      <p class="text-h6 text-medium-emphasis mt-4">Loading drafts...</p>
    </div>

    <!-- Drafts Grid -->
    <div v-else-if="hasDrafts" class="drafts-grid">
      <v-card
        v-for="draft in drafts"
        :key="draft.id"
        class="draft-card"
        elevation="2"
        rounded="lg"
        @click="openDraft(draft)"
      >
        <v-card-item class="pa-6">
          <!-- Header -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center gap-3">
              <v-chip
                :color="getCategoryColor(draft.category_id)"
                variant="flat"
                size="small"
              >
                {{ draft.category_name || 'General' }}
              </v-chip>
              <v-chip
                color="info"
                variant="outlined"
                size="x-small"
              >
                Draft
              </v-chip>
              <!-- Draft Type Indicator -->
              <v-chip
                v-if="draft.original_proposal_id"
                color="warning"
                variant="flat"
                size="x-small"
                prepend-icon="mdi-pencil"
              >
                Contribution
              </v-chip>
              <v-chip
                v-else
                color="success"
                variant="flat"
                size="x-small"
                prepend-icon="mdi-plus"
              >
                New Proposal
              </v-chip>
            </div>
            
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                  @click.stop
                />
              </template>
              
              <v-list>
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Edit Draft"
                  @click="openDraft(draft)"
                />
                <v-list-item
                  prepend-icon="mdi-send"
                  title="Convert to Proposal"
                  @click="convertDraft(draft.id)"
                />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete Draft"
                  @click="deleteDraft(draft.id)"
                  color="error"
                />
              </v-list>
            </v-menu>
          </div>

          <!-- Title -->
          <h3 class="text-h6 font-weight-bold text-primary mb-3">
            {{ draft.title || 'Untitled Draft' }}
          </h3>

          <!-- Summary -->
          <p v-if="draft.summary" class="text-body-2 text-medium-emphasis mb-4 line-clamp-2">
            {{ draft.summary }}
          </p>

          <!-- Progress Indicator -->
          <div class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption text-medium-emphasis">Completion</span>
              <span class="text-caption font-weight-bold">{{ getDraftProgress(draft) }}%</span>
            </div>
            <v-progress-linear
              :model-value="getDraftProgress(draft)"
              :color="getProgressColor(getDraftProgress(draft))"
              height="6"
              rounded
            />
          </div>

          <!-- Details -->
          <div class="draft-details">
            <div class="d-flex align-center gap-4 text-caption text-medium-emphasis">
              <div class="d-flex align-center gap-1">
                <v-icon size="16">mdi-calendar</v-icon>
                {{ formatDate(draft.updated_at) }}
              </div>
              <div class="d-flex align-center gap-1">
                <v-icon size="16">mdi-file-document</v-icon>
                {{ draft.attachments?.length || 0 }} files
              </div>
            </div>
          </div>
        </v-card-item>

        <!-- Actions -->
        <v-card-actions class="pa-6 pt-0">
          <v-btn
            variant="outlined"
            color="primary"
            @click.stop="openDraft(draft)"
            prepend-icon="mdi-pencil"
            size="small"
          >
            Continue Editing
          </v-btn>
          
          <v-btn
            variant="outlined"
            color="error"
            @click.stop="deleteDraft(draft.id)"
            prepend-icon="mdi-delete"
            size="small"
          >
            Delete
          </v-btn>
          
          <v-spacer />
          
          <v-btn
            color="success"
            variant="flat"
            @click.stop="convertDraft(draft.id)"
            prepend-icon="mdi-send"
            size="small"
            elevation="1"
          >
            Submit Proposal
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-12">
      <v-card elevation="0" class="pa-12">
        <v-icon icon="mdi-file-document-outline" size="80" color="medium-emphasis" class="mb-6" />
        <h2 class="text-h5 font-weight-bold text-medium-emphasis mb-3">No Drafts Yet</h2>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Start creating a proposal and save it as a draft to continue working on it later.
        </p>
        <v-btn
          color="primary"
          variant="flat"
          :to="'/create'"
          prepend-icon="mdi-plus"
          size="large"
          elevation="2"
        >
          Create Your First Draft
        </v-btn>
      </v-card>
    </div>

    <!-- Convert Draft Dialog -->
    <v-dialog v-model="showConvertDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-4">
          Convert Draft to Proposal
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-1 mb-4">
            Are you sure you want to convert this draft to a final proposal? 
            The draft will be deleted after conversion.
          </p>
          <v-alert type="info" variant="tonal" class="mb-0">
            <v-icon class="mr-2">mdi-information</v-icon>
            Make sure all required fields are filled before converting.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showConvertDialog = false"
            size="small"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            @click="confirmConvertDraft"
            :loading="converting"
            size="small"
          >
            Convert & Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Draft Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-4">
          Delete Draft
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-1 mb-4">
            Are you sure you want to delete this draft? This action cannot be undone.
          </p>
          <v-alert type="warning" variant="tonal" class="mb-0">
            <v-icon class="mr-2">mdi-alert</v-icon>
            All your work on this draft will be lost.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showDeleteDialog = false"
            size="small"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmDeleteDraft"
            :loading="deleting"
            size="small"
          >
            Delete Draft
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="4000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="6000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDraftStore } from '@/stores/draft';
import { useAuthStore } from '@/stores/auth';
import { useProposalStore } from '@/stores/proposal';

const router = useRouter();
const draftStore = useDraftStore();
const authStore = useAuthStore();

// Reactive state
const showConvertDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedDraftId = ref(null);
const converting = ref(false);
const deleting = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Computed properties
const loading = computed(() => draftStore.loading);
const drafts = computed(() => draftStore.drafts);
const hasDrafts = computed(() => draftStore.hasDrafts);

// Methods
const openDraft = (draft) => {
  if (draft.id === 'local') {
    // For localStorage drafts, navigate to create page without query params
    // The form will automatically load from localStorage
    router.push('/create');
  } else {
    // Navigate to create page with draft data
    router.push({
      path: '/create',
      query: { draft: draft.id }
    });
  }
};

const convertDraft = (draftId) => {
  selectedDraftId.value = draftId;
  showConvertDialog.value = true;
};

const confirmConvertDraft = async () => {
  if (!selectedDraftId.value) return;
  
  converting.value = true;
  
  try {
    if (selectedDraftId.value === 'local') {
      // Convert localStorage draft to proposal
      const draftKey = `proposal_draft_${authStore.currentUser?.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        
        // Create proposal from localStorage draft
        const proposalData = {
          title: draftData.title,
          category_id: draftData.category_id,
          municipality_id: draftData.municipality_id || 1,
          summary: draftData.summary,
          details: draftData.details,
          attachments: draftData.attachments || [],
          author_id: authStore.currentUser?.id,
          status: 'active'
        };
        
        // Use proposal store to create proposal
        const proposalStore = useProposalStore();
        const newProposal = await proposalStore.createProposal(proposalData);
        
        if (newProposal) {
          // Clear localStorage draft
          localStorage.removeItem(draftKey);
          draftStore.drafts = draftStore.drafts.filter(d => d.id !== 'local');
          
          successMessage.value = 'Local draft converted to proposal successfully!';
          showSuccess.value = true;
          
          // Navigate to the new proposal
          setTimeout(() => {
            router.push(`/proposal/${newProposal.id}`);
          }, 2000);
        }
      }
    } else {
      const proposal = await draftStore.convertDraftToProposal(selectedDraftId.value);
      
      if (proposal) {
        successMessage.value = 'Draft converted to proposal successfully!';
        showSuccess.value = true;
        
        // Navigate to the new proposal
        setTimeout(() => {
          router.push(`/proposal/${proposal.id}`);
        }, 2000);
      }
    }
  } catch (error) {
    errorMessage.value = 'Failed to convert draft to proposal';
    showError.value = true;
  } finally {
    converting.value = false;
    showConvertDialog.value = false;
    selectedDraftId.value = null;
  }
};

const deleteDraft = (draftId) => {
  selectedDraftId.value = draftId;
  showDeleteDialog.value = true;
};

const confirmDeleteDraft = async () => {
  if (!selectedDraftId.value) return;
  
  deleting.value = true;
  
  try {
    if (selectedDraftId.value === 'local') {
      // Delete localStorage draft
      localStorage.removeItem(`proposal_draft_${authStore.currentUser?.id}`);
      draftStore.drafts = draftStore.drafts.filter(d => d.id !== 'local');
      successMessage.value = 'Local draft deleted successfully';
      showSuccess.value = true;
    } else {
      const success = await draftStore.deleteDraft(selectedDraftId.value);
      
      if (success) {
        successMessage.value = 'Draft deleted successfully';
        showSuccess.value = true;
      }
    }
  } catch (error) {
    errorMessage.value = 'Failed to delete draft';
    showError.value = true;
  } finally {
    deleting.value = false;
    showDeleteDialog.value = false;
    selectedDraftId.value = null;
  }
};

// Helper methods
const getDraftProgress = (draft) => {
  let completed = 0;
  let total = 0;
  
  if (draft.title) completed++;
  total++;
  
  if (draft.category_id) completed++;
  total++;
  
  if (draft.summary) completed++;
  total++;
  
  if (draft.details?.problem) completed++;
  total++;
  
  if (draft.details?.solution) completed++;
  total++;
  
  return Math.round((completed / total) * 100);
};

const getProgressColor = (progress) => {
  if (progress >= 80) return 'success';
  if (progress >= 50) return 'warning';
  return 'error';
};

const getCategoryColor = (categoryId) => {
  if (categoryId === null) return 'grey'; // For localStorage drafts
  const colors = ['primary', 'secondary', 'accent', 'success', 'info', 'warning'];
  return colors[categoryId % colors.length] || 'primary';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Lifecycle
onMounted(async () => {
  try {
    await draftStore.fetchDrafts();
  } catch (error) {
    console.log('Backend unavailable, showing localStorage drafts...');
    // Show localStorage drafts as fallback
    showLocalStorageDrafts();
  }
});

// Show localStorage drafts as fallback
const showLocalStorageDrafts = () => {
  try {
    const draftKey = `proposal_draft_${authStore.currentUser?.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      // Create a mock draft object for display
      const mockDraft = {
        id: 'local',
        title: draftData.title || 'Untitled Draft',
        category_id: draftData.category_id || null,
        summary: draftData.summary || '',
        details: draftData.details || {},
        attachments: draftData.attachments || [],
        created_at: draftData.lastModified || new Date().toISOString(),
        updated_at: draftData.lastModified || new Date().toISOString(),
        category_name: 'Local Draft'
      };
      
      // Add to drafts array
      draftStore.drafts.unshift(mockDraft);
    }
  } catch (error) {
    console.error('Error loading localStorage drafts:', error);
  }
};
</script>

<style scoped>
.drafts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.draft-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.draft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.draft-details {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 16px;
}

.empty-state {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  border-radius: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .drafts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: stretch !important;
    gap: 16px;
  }
}
</style>
