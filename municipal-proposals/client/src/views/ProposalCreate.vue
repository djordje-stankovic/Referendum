<template>
  <v-container class="py-4">
    <v-row>
      <v-col cols="12">
        <!-- Header with Progress and Actions -->
        <v-card class="mb-4" elevation="1" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary" size="24">mdi-plus-circle</v-icon>
              <div>
                <h1 class="text-h5 font-weight-bold text-primary mb-0">Create New Proposal</h1>
                <p class="text-caption text-medium-emphasis mb-0">
                  Municipality: <strong>{{ userMunicipality }}</strong>
                </p>
              </div>
            </div>
            
            <div class="d-flex align-center gap-2">
              <!-- Progress Indicator -->
              <div class="text-center mr-3">
                <v-progress-circular
                  :model-value="formProgress"
                  :color="formProgress >= 80 ? 'success' : formProgress >= 50 ? 'warning' : 'error'"
                  size="40"
                  width="4"
                >
                  <span class="text-caption font-weight-bold">{{ formProgress }}%</span>
                </v-progress-circular>
                <div class="text-caption text-medium-emphasis mt-1">Complete</div>
              </div>
              
              <!-- Action Buttons -->
              <v-btn 
                color="primary" 
                variant="flat"
                @click="createProposal"
                :loading="loading"
                :disabled="formProgress < 50"
                prepend-icon="mdi-send"
                size="small"
                elevation="1"
              >
                Submit
              </v-btn>
            </div>
          </v-card-title>
          
          <!-- Auto-save Status -->
          <v-card-text class="pt-0 pb-3">
            <v-alert 
              :type="lastSaved ? 'success' : 'info'" 
              variant="tonal" 
              class="mb-0 py-2"
              :icon="lastSaved ? 'mdi-check-circle' : 'mdi-clock-outline'"
              density="compact"
            >
              <span v-if="lastSaved">
                Last saved: {{ formatTime(lastSaved) }} 
                <v-chip color="success" variant="flat" size="x-small" class="ml-2">Auto-saved</v-chip>
              </span>
              <span v-else>
                Changes will be auto-saved as you type
              </span>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Main Form - Modern Inline Style -->
        <v-card elevation="1" rounded="lg">
          <v-card-text class="pa-6">
            <v-form ref="formRef" class="modern-inline-form">
              <!-- Title Section -->
              <div class="form-line">
                <v-chip class="form-label" color="primary" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-format-title</v-icon>
                  TITLE
                </v-chip>
                <div class="form-content">
                  <v-textarea 
                    v-model="formData.title" 
                    placeholder="Enter your proposal title here..."
                    variant="outlined"
                    hide-details
                    auto-grow
                    rows="1"
                    density="compact"
                    class="title-input"
                    :rules="[v => !!v || 'Title is required']"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- Category Section -->
              <div class="form-line">
                <v-chip class="form-label" color="primary" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-tag</v-icon>
                  CATEGORY
                </v-chip>
                <div class="form-content">
                  <v-select
                    v-model="formData.category_id"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    placeholder="Select category"
                    variant="outlined"
                    hide-details
                    density="compact"
                    class="category-select"
                    :rules="[v => !!v || 'Category is required']"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- Problem Description Section -->
              <div class="form-line">
                <v-chip class="form-label" color="error" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-alert-circle</v-icon>
                  PROBLEM
                </v-chip>
                <div class="form-content">
                  <v-textarea 
                    v-model="formData.details.problem" 
                    placeholder="Describe the problem in detail. You can write as much as needed..."
                    variant="outlined"
                    hide-details
                    auto-grow
                    rows="3"
                    density="compact"
                    class="problem-input"
                    :rules="[v => !!v || 'Problem description is required']"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- Solution Section -->
              <div class="form-line">
                <v-chip class="form-label" color="success" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-lightbulb</v-icon>
                  SOLUTION
                </v-chip>
                <div class="form-content">
                  <v-textarea 
                    v-model="formData.details.solution" 
                    placeholder="Explain your proposed solution in detail. Include implementation steps, timeline, etc..."
                    variant="outlined"
                    hide-details
                    auto-grow
                    rows="3"
                    density="compact"
                    class="solution-input"
                    :rules="[v => !!v || 'Solution is required']"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- Summary Section -->
              <div class="form-line">
                <v-chip class="form-label" color="primary" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-text</v-icon>
                  SUMMARY
                </v-chip>
                <div class="form-content">
                  <v-textarea 
                    v-model="formData.summary" 
                    placeholder="Provide a comprehensive summary of your proposal..."
                    variant="outlined"
                    hide-details
                    auto-grow
                    rows="2"
                    density="compact"
                    class="summary-input"
                    :rules="[v => !!v || 'Summary is required']"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- Cost Section -->
              <div class="form-line">
                <v-chip class="form-label" color="info" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-currency-eur</v-icon>
                  COST
                </v-chip>
                <div class="form-content">
                  <v-textarea 
                    v-model="formData.details.cost" 
                    placeholder="Enter estimated cost and any financial details..."
                    variant="outlined"
                    hide-details
                    auto-grow
                    rows="1"
                    density="compact"
                    class="cost-input"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- Impact Section -->
              <div class="form-line">
                <v-chip class="form-label" color="warning" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-target</v-icon>
                  IMPACT
                </v-chip>
                <div class="form-content">
                  <v-textarea 
                    v-model="formData.details.impact" 
                    placeholder="Describe the expected impact, benefits, and long-term effects..."
                    variant="outlined"
                    hide-details
                    auto-grow
                    rows="2"
                    density="compact"
                    class="impact-input"
                  />
                </div>
              </div>

              <!-- Spacing -->
              <div class="form-spacing"></div>

              <!-- File Attachments Section -->
              <div class="form-line">
                <v-chip class="form-label" color="primary" variant="flat" size="small">
                  <v-icon size="16" class="mr-2">mdi-file-document</v-icon>
                  FILES
                </v-chip>
                <div class="form-content">
                  <!-- Existing files -->
                  <div v-if="formData.attachments && formData.attachments.length > 0" class="mb-3">
                    <v-chip-group>
                      <v-chip 
                        v-for="(file, index) in formData.attachments" 
                        :key="index"
                        variant="outlined"
                        color="primary"
                        closable
                        size="small"
                        @click:close="removeAttachment(index)"
                      >
                        <v-icon class="mr-1" size="16">mdi-file</v-icon>
                        {{ file.name }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <!-- File upload -->
                  <v-file-input
                    v-model="newFiles"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    placeholder="Click to add files or drag and drop"
                    variant="outlined"
                    prepend-icon="mdi-upload"
                    show-size
                    counter
                    hide-details
                    density="compact"
                    hint="Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF"
                    persistent-hint
                    class="attachment-input"
                    @change="handleFileUpload"
                  />
                </div>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Bottom Action Bar -->
        <v-card class="mt-4" elevation="1" rounded="lg">
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn 
              variant="outlined" 
              @click="goBack"
              size="small"
              prepend-icon="mdi-arrow-left"
              class="mr-2"
            >
              Cancel
            </v-btn>
            
            <v-btn 
              color="primary" 
              variant="flat"
              @click="createProposal"
              :loading="loading"
              :disabled="formProgress < 50"
              size="small"
              prepend-icon="mdi-send"
              elevation="1"
            >
              Submit Proposal
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProposalStore } from '@/stores/proposal';
import { useDraftStore } from '@/stores/draft';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const store = useProposalStore();
const draftStore = useDraftStore();
const authStore = useAuthStore();

const formRef = ref(null);
const loading = ref(false);
const draftLoading = ref(false);
const newFiles = ref([]);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const lastSaved = ref(null);
const currentDraftId = ref(null);

const formData = ref({
  title: '',
  category_id: null,
  municipality_id: 1,
  summary: '',
  details: { 
    problem: '', 
    solution: '', 
    cost: '', 
    impact: '' 
  },
  attachments: [],
});

// Watch for form data changes and trigger auto-save
watch(formData, () => {
  onFormChange();
}, { deep: true });

// Get user's municipality from auth store
const userMunicipality = computed(() => {
  return authStore.currentUser?.municipality || 'Unknown';
});

// Get categories from store
const categories = computed(() => store.categories);

// Calculate form completion progress
const formProgress = computed(() => {
  let completed = 0;
  let total = 0;
  
  // Required fields
  if (formData.value.title) completed++;
  total++;
  
  if (formData.value.category_id) completed++;
  total++;
  
  if (formData.value.summary) completed++;
  total++;
  
  if (formData.value.details.problem) completed++;
  total++;
  
  if (formData.value.details.solution) completed++;
  total++;
  
  // Optional fields (count as half)
  if (formData.value.details.cost) completed += 0.5;
  total += 0.5;
  
  if (formData.value.details.impact) completed += 0.5;
  total += 0.5;
  
  if (formData.value.attachments.length > 0) completed += 0.5;
  total += 0.5;
  
  return Math.round((completed / total) * 100);
});

// Auto-save functionality
let autoSaveTimeout;
const onFormChange = () => {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  // Set new timeout for auto-save (2 seconds after last change)
  autoSaveTimeout = setTimeout(() => {
    saveAsDraft(true); // Silent save
  }, 2000);
};

// Save as draft
const saveAsDraft = async (silent = false) => {
  if (draftLoading.value) return;
  
  draftLoading.value = true;
  try {
    // Prepare draft data
    const draftData = {
      title: formData.value.title,
      category_id: formData.value.category_id,
      municipality_id: formData.value.municipality_id,
      summary: formData.value.summary,
      details: formData.value.details,
      attachments: formData.value.attachments.map(f => f.name || f),
    };
    
    // If we have a current draft ID, include it for update
    if (currentDraftId.value) {
      draftData.draft_id = currentDraftId.value;
    }
    
    // Save via draft store
    const savedDraft = await draftStore.saveDraft(draftData);
    
    if (savedDraft) {
      // Update current draft ID if this is a new draft
      if (!currentDraftId.value) {
        currentDraftId.value = savedDraft.id;
      }
      
      lastSaved.value = new Date();
      
      if (!silent) {
        successMessage.value = 'Draft saved successfully!';
        showSuccess.value = true;
      }
    }
    
  } catch (error) {
    console.error('Error saving draft:', error);
    
    // If backend is not available, save to localStorage as fallback
    if (error.message.includes('Failed to fetch') || error.message.includes('Failed to save')) {
      try {
        const fallbackData = {
          ...formData.value,
          lastModified: new Date().toISOString(),
          author_id: authStore.currentUser?.id
        };
        
        localStorage.setItem(`proposal_draft_${authStore.currentUser?.id}`, JSON.stringify(fallbackData));
        lastSaved.value = new Date();
        
        if (!silent) {
          successMessage.value = 'Draft saved locally (backend unavailable)';
          showSuccess.value = true;
        }
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        if (!silent) {
          errorMessage.value = 'Failed to save draft. Please try again.';
          showError.value = true;
        }
      }
    } else {
      if (!silent) {
        errorMessage.value = 'Failed to save draft. Please try again.';
        showError.value = true;
      }
    }
  } finally {
    draftLoading.value = false;
  }
};

// Load draft from store or route
const loadDraft = async () => {
  try {
    // Check if we're loading a specific draft from route
    const draftId = route.query.draft;
    
    if (draftId) {
      try {
        const draft = await draftStore.fetchDraft(draftId);
        if (draft) {
          formData.value = {
            title: draft.title || '',
            category_id: draft.category_id || null,
            municipality_id: draft.municipality_id || 1,
            summary: draft.summary || '',
            details: draft.details || { problem: '', solution: '', cost: '', impact: '' },
            attachments: draft.attachments || [],
          };
          
          currentDraftId.value = draft.id;
          lastSaved.value = new Date(draft.updated_at);
          
          // Show notification
          successMessage.value = 'Draft loaded successfully!';
          showSuccess.value = true;
        }
      } catch (error) {
        console.log('Backend unavailable, trying localStorage fallback...');
        // Try to load from localStorage as fallback
        loadDraftFromLocalStorage();
      }
    }
    // Don't load drafts automatically when creating new proposal
  } catch (error) {
    console.error('Error loading draft:', error);
  }
};

// Load draft from localStorage as fallback
const loadDraftFromLocalStorage = () => {
  try {
    const draftKey = `proposal_draft_${authStore.currentUser?.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      formData.value = { ...formData.value, ...draftData };
      lastSaved.value = new Date(draftData.lastModified);
      
      // Show notification
      successMessage.value = 'Local draft loaded successfully!';
      showSuccess.value = true;
    }
  } catch (error) {
    console.error('Error loading draft from localStorage:', error);
  }
};

// Handle file upload
const handleFileUpload = (files) => {
  if (files) {
    const fileArray = Array.from(files);
    formData.value.attachments = [
      ...formData.value.attachments,
      ...fileArray.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }))
    ];
  }
  newFiles.value = null; // Reset file input
};

// Remove attachment
const removeAttachment = (index) => {
  formData.value.attachments.splice(index, 1);
};

// Create proposal
const createProposal = async () => {
  loading.value = true;
  try {
    // Validate required fields
    if (!formData.value.title || !formData.value.summary || !formData.value.category_id) {
      errorMessage.value = 'Please fill in all required fields: Title, Category, and Summary';
      showError.value = true;
      return;
    }

    // Prepare proposal data
    const proposalData = {
      title: formData.value.title,
      category_id: formData.value.category_id,
      municipality_id: formData.value.municipality_id,
      summary: formData.value.summary,
      details: formData.value.details,
      attachments: formData.value.attachments.map(f => f.name || f),
      author_id: authStore.currentUser?.id,
      status: 'active'
    };

    // Create proposal via store
    const newProposal = await store.createProposal(proposalData);
    
    if (newProposal) {
      // Delete draft after successful submission if it exists
      if (currentDraftId.value) {
        try {
          await draftStore.deleteDraft(currentDraftId.value);
        } catch (error) {
          console.log('Backend unavailable, clearing localStorage draft...');
          // Clear from localStorage as fallback
          localStorage.removeItem(`proposal_draft_${authStore.currentUser?.id}`);
        }
        currentDraftId.value = null;
      } else {
        // Clear any localStorage draft
        localStorage.removeItem(`proposal_draft_${authStore.currentUser?.id}`);
      }
      
      successMessage.value = 'Proposal created successfully! It will be reviewed by administrators.';
      showSuccess.value = true;
      
      // Navigate to the new proposal after a short delay
      setTimeout(() => {
        router.push(`/proposal/${newProposal.id}`);
      }, 2000);
    } else {
      throw new Error('Failed to create proposal');
    }
    
  } catch (error) {
    console.error('Error creating proposal:', error);
    errorMessage.value = 'Error creating proposal. Please try again.';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// Go back
const goBack = () => {
  // Save draft before leaving
  saveAsDraft(true);
  router.go(-1);
};

// Format time for display
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

onMounted(async () => {
  // Fetch categories
  await store.fetchCategories();
  
  // Set default category if available
  if (store.categories.length > 0) {
    formData.value.category_id = store.categories[0].id;
  }
  
  // Load draft if exists
  await loadDraft();
  
  // Set municipality based on user
  if (authStore.currentUser?.municipality_id) {
    formData.value.municipality_id = authStore.currentUser.municipality_id;
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
});
</script>

<style scoped>
/* Modern Inline Form */
.modern-inline-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

/* Form line styling */
.form-line {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  min-height: 40px;
}

/* Form label styling - Modern chip style */
.form-label {
  min-width: 120px;
  margin-right: 16px;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Form content styling */
.form-content {
  flex: 1;
  min-width: 0;
}

/* Form spacing */
.form-spacing {
  height: 20px;
  margin: 4px 0;
}

/* Input styling */
.title-input,
.problem-input,
.solution-input,
.summary-input,
.cost-input,
.impact-input {
  font-size: 16px;
  line-height: 1.5;
}

/* Category select styling */
.category-select {
  min-width: 200px;
}

/* Attachment input styling */
.attachment-input {
  margin-top: 8px;
}

/* Card styling */
.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Progress indicator */
.v-progress-circular {
  transition: all 0.2s ease;
}

/* Auto-save animation */
.v-alert {
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;
  }
  
  .d-flex.align-center.gap-2 {
    justify-content: center;
  }
  
  .form-line {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-label {
    min-width: auto;
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .form-content {
    width: 100%;
  }
}
</style>