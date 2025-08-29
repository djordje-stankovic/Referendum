<template>
  <v-container class="py-4">
    <v-row>
      <v-col cols="12">
        <!-- Header with Progress and Actions -->
        <v-card class="mb-4 sticky-header" elevation="1" rounded="lg">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary" size="24">mdi-pencil</v-icon>
              <div>
                <h1 class="text-h5 font-weight-bold text-primary mb-0">Contribute to Proposal</h1>
                <p class="text-caption text-medium-emphasis mb-0">
                  Municipality: <strong>{{ userMunicipality }}</strong>
                </p>
                <p class="text-caption text-medium-emphasis mb-0">
                  Your changes will be sent to the author for approval
                </p>
              </div>
            </div>
            
            <div class="d-flex align-center gap-2">
              <!-- Action Buttons -->
              <v-btn 
                variant="outlined" 
                @click="goBack"
                size="small"
                prepend-icon="mdi-arrow-left"
              >
                Cancel
              </v-btn>
              
              <v-btn 
                color="secondary" 
                variant="outlined"
                @click="saveAsDraft"
                :loading="draftLoading"
                prepend-icon="mdi-content-save-outline"
                size="small"
              >
                Save as Draft
              </v-btn>
              
              <v-btn 
                color="success" 
                variant="flat"
                @click="submitContribution"
                :loading="loading"
                prepend-icon="mdi-send"
                size="small"
                elevation="1"
              >
                Submit Contribution
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
      </v-col>
    </v-row>
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
const originalProposalId = ref(null);

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
  
  const progress = Math.round((completed / total) * 100);
  
  // Debug logging removed for cleaner console
  
  return progress;
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

// Watch for form progress changes (after formProgress is defined)
watch(formProgress, (newProgress) => {
  // Progress tracking for future use
});

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
      original_proposal_id: originalProposalId.value, // Link to original proposal
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
          author_id: authStore.currentUser?.id,
          original_proposal_id: originalProposalId.value
        };
        
        localStorage.setItem(`proposal_edit_draft_${originalProposalId.value}`, JSON.stringify(fallbackData));
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

// Load proposal data
const loadProposal = async () => {
  try {
    const proposalId = route.params.id;
    if (!proposalId) {
      errorMessage.value = 'No proposal ID provided';
      showError.value = true;
      return;
    }
    
    originalProposalId.value = proposalId;
    
    // Fetch proposal data
    const proposal = await store.fetchProposal(proposalId);
    if (proposal) {
      formData.value = {
        title: proposal.title || '',
        category_id: proposal.category_id || null,
        municipality_id: proposal.municipality_id || 1,
        summary: proposal.summary || '',
        details: {
          problem: proposal.problem_description || '',
          solution: proposal.proposed_solution || '',
          cost: proposal.estimated_cost || '',
          impact: proposal.expected_impact || ''
        },
        attachments: proposal.attachments || [],
      };
      
      lastSaved.value = new Date();
    }
    
    // Check if there's an existing draft for this proposal
    await loadExistingDraft();
    
  } catch (error) {
    console.error('Error loading proposal:', error);
    errorMessage.value = 'Failed to load proposal data';
    showError.value = true;
  }
};

// Load existing draft for this proposal
const loadExistingDraft = async () => {
  try {
    // Try to find draft linked to this proposal
    const drafts = await draftStore.fetchDrafts();
    const existingDraft = drafts.find(d => d.original_proposal_id === originalProposalId.value);
    
    if (existingDraft) {
      // Load draft data
      formData.value = {
        title: existingDraft.title || formData.value.title,
        category_id: existingDraft.category_id || formData.value.category_id,
        municipality_id: existingDraft.municipality_id || formData.value.municipality_id,
        summary: existingDraft.summary || formData.value.summary,
        details: existingDraft.details || formData.value.details,
        attachments: existingDraft.attachments || formData.value.attachments,
      };
      
      currentDraftId.value = existingDraft.id;
      lastSaved.value = new Date(existingDraft.updated_at);
      
      successMessage.value = 'Existing draft loaded successfully!';
      showSuccess.value = true;
    }
  } catch (error) {
    console.log('No existing draft found or backend unavailable');
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

// Submit contribution for approval
const submitContribution = async () => {
  loading.value = true;
  try {
    // Allow submission even with incomplete fields - user can submit partial contributions
    // Only check if we have at least some basic data
    if (!formData.value.title || !formData.value.category_id) {
      errorMessage.value = 'Please provide at least a title and category for your contribution';
      showError.value = true;
      return;
    }

    // Use the loaded proposal data for comparison (already loaded in loadProposal)
    // We need to fetch the original proposal data again since we don't have it in scope
    const originalProposal = await store.fetchProposal(originalProposalId.value);
    
    // Prepare contribution data - map details to actual database columns
    const contributionData = {
      proposal_id: originalProposalId.value,
      user_id: authStore.currentUser.id,
      field_name: 'multiple_fields',
      old_value: JSON.stringify({
        title: originalProposal?.title || '',
        category_id: originalProposal?.category_id || '',
        municipality_id: originalProposal?.municipality_id || '',
        summary: originalProposal?.summary || '',
        problem_description: originalProposal?.details?.problem || '',
        proposed_solution: originalProposal?.details?.solution || '',
        estimated_cost: originalProposal?.details?.cost || '',
        expected_impact: originalProposal?.details?.impact || '',
      }),
      new_value: JSON.stringify({
        title: formData.value.title,
        category_id: formData.value.category_id,
        municipality_id: formData.value.municipality_id,
        summary: formData.value.summary || '',
        problem_description: formData.value.details.problem || '',
        proposed_solution: formData.value.details.solution || '',
        estimated_cost: formData.value.details.cost || '',
        expected_impact: formData.value.details.impact || '',
        // Note: attachments field doesn't exist in proposals table, so we'll skip it
      }),
      edit_summary: 'User contribution to improve the proposal',
      contribution_type: 'edit',
      status: 'pending'
    };

         // Contribution data prepared successfully

    // Submit contribution via API
    const response = await fetch(`${authStore.baseUrl}/api/proposals/${originalProposalId.value}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contributionData)
    });

    if (response.ok) {
      successMessage.value = 'Contribution submitted successfully! The author will review your changes.';
      showSuccess.value = true;
      
      // Navigate back to the proposal after a short delay
      setTimeout(() => {
        router.push(`/proposal/${originalProposalId.value}`);
      }, 2000);
    } else {
      throw new Error('Failed to submit contribution');
    }
    
  } catch (error) {
    console.error('Error submitting contribution:', error);
    errorMessage.value = 'Error submitting contribution. Please try again.';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// Update proposal
const updateProposal = async () => {
  loading.value = true;
  try {
    // Allow submission even with incomplete fields - user can submit partial updates
    // Only check if we have at least some basic data
    if (!formData.value.title || !formData.value.category_id) {
      errorMessage.value = 'Please provide at least a title and category for your update';
      showError.value = true;
      return;
    }

    // Prepare proposal data
    const proposalData = {
      id: originalProposalId.value,
      title: formData.value.title,
      category_id: formData.value.category_id,
      municipality_id: formData.value.municipality_id,
      summary: formData.value.summary || '',
      problem_description: formData.value.details.problem || '',
      proposed_solution: formData.value.details.solution || '',
      estimated_cost: formData.value.details.cost || null,
      expected_impact: formData.value.details.impact || null,
      // Note: attachments field doesn't exist in proposals table, so we'll skip it
    };

    // Update proposal via store
    const updatedProposal = await store.updateProposal(proposalData);
    
    if (updatedProposal) {
      // Delete draft after successful update if it exists
      if (currentDraftId.value) {
        try {
          await draftStore.deleteDraft(currentDraftId.value);
        } catch (error) {
          console.log('Backend unavailable, clearing localStorage draft...');
          // Clear from localStorage as fallback
          localStorage.removeItem(`proposal_edit_draft_${originalProposalId.value}`);
        }
        currentDraftId.value = null;
      } else {
        // Clear any localStorage draft
        localStorage.removeItem(`proposal_edit_draft_${originalProposalId.value}`);
      }
      
      successMessage.value = 'Proposal updated successfully!';
      showSuccess.value = true;
      
      // Navigate back to the proposal after a short delay
      setTimeout(() => {
        router.push(`/proposal/${updatedProposal.id}`);
      }, 2000);
    } else {
      throw new Error('Failed to update proposal');
    }
    
  } catch (error) {
    console.error('Error updating proposal:', error);
    errorMessage.value = 'Error updating proposal. Please try again.';
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
  
  // Load proposal data
  await loadProposal();
  
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

/* Sticky header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff; /* Ensure it's visible on top */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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


