<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 font-weight-bold pa-6 pb-4">
            <v-icon class="mr-3" color="primary" size="32">mdi-plus-circle</v-icon>
            Create New Proposal
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              variant="outlined"
              @click="createProposal"
              :loading="loading"
              prepend-icon="mdi-content-save"
            >
              Submit Proposal
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pa-6 pt-0">
            <v-alert type="info" variant="tonal" class="mb-6">
              <v-icon class="mr-2">mdi-information</v-icon>
              Click on any field to expand it for easier editing. Your proposal will be automatically associated with your municipality: <strong>{{ userMunicipality }}</strong>
            </v-alert>
            
            <v-form ref="formRef">
              <!-- Title -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-primary">Title</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('title')"
                        color="primary"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ formData.title || 'No title set' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Category -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-primary">Category</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('category')"
                        color="primary"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ getCategoryName(formData.category_id) || 'No category selected' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Municipality (Read-only) -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card" color="grey-lighten-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-primary">Municipality</h3>
                      <v-chip color="info" variant="tonal">
                        <v-icon class="mr-2">mdi-lock</v-icon>
                        Auto-set
                      </v-chip>
                    </div>
                    <div class="text-body-1 font-weight-medium">{{ userMunicipality }}</div>
                    <div class="text-caption text-medium-emphasis mt-2">
                      Your municipality is automatically set based on your profile and cannot be changed
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Summary -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-primary">Summary</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('summary')"
                        color="primary"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ formData.summary || 'No summary provided' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Problem -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-error">Problem Description</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('problem')"
                        color="error"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ formData.details?.problem || 'No problem description provided' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Solution -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-success">Proposed Solution</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('solution')"
                        color="success"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ formData.details?.solution || 'No solution proposed' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Cost -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-info">Estimated Cost</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('cost')"
                        color="info"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ formData.details?.cost || 'No cost estimate provided' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Impact -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-warning">Expected Impact</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('impact')"
                        color="warning"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    <div class="text-body-1">{{ formData.details?.impact || 'No impact description provided' }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- File Attachments -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 field-card">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-primary">File Attachments</h3>
                      <v-btn 
                        icon 
                        variant="text" 
                        @click="expandField('attachments')"
                        color="primary"
                        size="large"
                      >
                        <v-icon size="28">mdi-arrow-expand</v-icon>
                      </v-btn>
                    </div>
                    
                    <!-- Existing files -->
                    <div v-if="formData.attachments && formData.attachments.length > 0" class="mb-4">
                      <div class="text-subtitle-2 mb-2">Attached files:</div>
                      <v-chip-group>
                        <v-chip 
                          v-for="(file, index) in formData.attachments" 
                          :key="index"
                          variant="outlined"
                          color="primary"
                          closable
                          @click:close="removeAttachment(index)"
                        >
                          <v-icon class="mr-2">mdi-file</v-icon>
                          {{ file.name }}
                        </v-chip>
                      </v-chip-group>
                    </div>
                    <div v-else class="text-medium-emphasis">
                      No files attached
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Field Expansion Modal - VELIKI MODAL SA PUNO PROSTORA -->
    <v-dialog v-model="showFieldModal" max-width="1200" persistent>
      <v-card class="field-expansion-modal">
        <v-card-title class="text-h4 font-weight-bold pa-6 pb-4">
          <v-icon class="mr-3" :color="getFieldColor(expandedField)" size="32">
            {{ getFieldIcon(expandedField) }}
          </v-icon>
          {{ getFieldLabel(expandedField) }}
          <v-spacer></v-spacer>
          <v-btn icon @click="closeFieldModal" variant="text" size="large">
            <v-icon size="28">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-0">
          <!-- Title Field -->
          <div v-if="expandedField === 'title'">
            <v-text-field 
              v-model="formData.title" 
              label="Title" 
              required
              variant="outlined"
              prepend-inner-icon="mdi-format-title"
              class="text-h5"
              rows="3"
              auto-grow
            ></v-text-field>
          </div>

          <!-- Category Field -->
          <div v-if="expandedField === 'category'">
            <v-select
              v-model="formData.category_id"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Category"
              required
              variant="outlined"
              prepend-inner-icon="mdi-tag"
              class="text-h5"
            ></v-select>
          </div>

          <!-- Summary Field -->
          <div v-if="expandedField === 'summary'">
            <v-textarea 
              v-model="formData.summary" 
              label="Summary" 
              required
              variant="outlined"
              prepend-inner-icon="mdi-text"
              rows="12"
              auto-grow
              class="text-body-1"
              hint="Provide a comprehensive summary of the proposal"
              persistent-hint
            ></v-textarea>
          </div>

          <!-- Problem Field -->
          <div v-if="expandedField === 'problem'">
            <v-textarea 
              v-model="formData.details.problem" 
              label="Problem Description" 
              required
              variant="outlined"
              prepend-inner-icon="mdi-alert-circle"
              rows="15"
              auto-grow
              class="text-body-1"
              hint="Describe the problem in detail. Be as comprehensive as possible."
              persistent-hint
            ></v-textarea>
          </div>

          <!-- Solution Field -->
          <div v-if="expandedField === 'solution'">
            <v-textarea 
              v-model="formData.details.solution" 
              label="Proposed Solution" 
              required
              variant="outlined"
              prepend-inner-icon="mdi-lightbulb"
              rows="15"
              auto-grow
              class="text-body-1"
              hint="Explain your proposed solution in detail. Include implementation steps if possible."
              persistent-hint
            ></v-textarea>
          </div>

          <!-- Cost Field -->
          <div v-if="expandedField === 'cost'">
            <v-text-field 
              v-model="formData.details.cost" 
              label="Estimated Cost" 
              required
              variant="outlined"
              prepend-inner-icon="mdi-currency-eur"
              hint="Enter estimated cost in euros"
              class="text-body-1"
              persistent-hint
            ></v-text-field>
          </div>

          <!-- Impact Field -->
          <div v-if="expandedField === 'impact'">
            <v-textarea 
              v-model="formData.details.impact" 
              label="Expected Impact" 
              required
              variant="outlined"
              prepend-inner-icon="mdi-target"
              rows="12"
              auto-grow
              class="text-body-1"
              hint="Describe the expected impact and benefits in detail"
              persistent-hint
            ></v-textarea>
          </div>

          <!-- Attachments Field -->
          <div v-if="expandedField === 'attachments'">
            <v-card variant="outlined" class="pa-6">
              <v-card-title class="text-h5 font-weight-medium mb-4">
                <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
                File Attachments
              </v-card-title>
              
              <!-- Existing files -->
              <div v-if="formData.attachments && formData.attachments.length > 0" class="mb-6">
                <div class="text-h6 mb-3">Current attachments:</div>
                <v-chip-group>
                  <v-chip 
                    v-for="(file, index) in formData.attachments" 
                    :key="index"
                    variant="outlined"
                    color="primary"
                    closable
                    size="large"
                    @click:close="removeAttachment(index)"
                  >
                    <v-icon class="mr-2">mdi-file</v-icon>
                    {{ file.name }}
                  </v-chip>
                </v-chip-group>
              </div>

              <!-- File upload -->
              <v-file-input
                v-model="newFiles"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                label="Add new files"
                variant="outlined"
                prepend-icon="mdi-upload"
                show-size
                counter
                size="large"
                hint="Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF"
                persistent-hint
                @change="handleFileUpload"
              ></v-file-input>
            </v-card>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="outlined" 
            @click="closeFieldModal"
            size="large"
            prepend-icon="mdi-arrow-left"
            class="mr-3"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveFieldChanges"
            size="large"
            prepend-icon="mdi-check"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const store = useProposalStore();
const authStore = useAuthStore();

const formRef = ref(null);
const loading = ref(false);
const newFiles = ref([]);
const showFieldModal = ref(false);
const expandedField = ref('');

const formData = ref({
  title: '',
  category_id: 1, // Default category ID
  municipality_id: 1, // Default municipality ID
  summary: '',
  details: { 
    problem: '', 
    solution: '', 
    cost: '', 
    impact: '' 
  },
  attachments: [],
});

// Get user's municipality from auth store
const userMunicipality = computed(() => {
  return authStore.currentUser?.municipality || 'Unknown';
});

// Get categories from store
const categories = computed(() => store.categories);

// Get category name by ID
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : 'Unknown';
};

// Populate municipality automatically
const populateMunicipality = () => {
  // Set municipality_id based on user's municipality
  // For now, hardcode to 1 (Novi Sad) - you can make this dynamic later
  formData.value.municipality_id = 1;
};

// Expand field modal
const expandField = (fieldName) => {
  expandedField.value = fieldName;
  showFieldModal.value = true;
};

// Close field modal
const closeFieldModal = () => {
  showFieldModal.value = false;
  expandedField.value = '';
};

// Save field changes
const saveFieldChanges = () => {
  closeFieldModal();
  // Changes are already saved in formData
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
    console.log('Form data for validation:', {
      title: formData.value.title,
      summary: formData.value.summary,
      category_id: formData.value.category_id,
      municipality_id: formData.value.municipality_id,
      authorId: authStore.currentUser?.id
    });
    
    if (!formData.value.title || !formData.value.summary || !formData.value.category_id) {
      alert('Please fill in all required fields: Title, Category, and Summary');
      return;
    }

    // Prepare proposal data
    const proposalData = {
      title: formData.value.title,
      category_id: formData.value.category_id || 1, // Send category_id instead of category
      municipality_id: formData.value.municipality_id || 1, // Send municipality_id instead of municipality
      summary: formData.value.summary,
      details: formData.value.details,
      attachments: formData.value.attachments.map(f => f.name),
      author_id: authStore.currentUser?.id,
      status: 'active'
    };

    // Create proposal via store
    const newProposal = await store.createProposal(proposalData);
    
    if (newProposal) {
      alert('Proposal created successfully! It will be reviewed by administrators.');
      // Navigate to the new proposal
      router.push(`/proposal/${newProposal.id}`);
    } else {
      throw new Error('Failed to create proposal');
    }
    
  } catch (error) {
    console.error('Error creating proposal:', error);
    alert('Error creating proposal. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Helper functions for field display
const getFieldLabel = (field) => {
  const labels = {
    title: 'Title',
    category: 'Category',
    summary: 'Summary',
    problem: 'Problem Description',
    solution: 'Proposed Solution',
    cost: 'Estimated Cost',
    impact: 'Expected Impact',
    attachments: 'File Attachments'
  };
  return labels[field] || field;
};

const getFieldIcon = (field) => {
  const icons = {
    title: 'mdi-format-title',
    category: 'mdi-tag',
    summary: 'mdi-text',
    problem: 'mdi-alert-circle',
    solution: 'mdi-lightbulb',
    cost: 'mdi-currency-eur',
    impact: 'mdi-target',
    attachments: 'mdi-file-document'
  };
  return icons[field] || 'mdi-pencil';
};

const getFieldColor = (field) => {
  const colors = {
    title: 'primary',
    category: 'primary',
    summary: 'primary',
    problem: 'error',
    solution: 'success',
    cost: 'info',
    impact: 'warning',
    attachments: 'primary'
  };
  return colors[field] || 'primary';
};

onMounted(async () => {
  // Dohvati sve potrebne podatke
  await Promise.all([
    store.fetchCategories()
  ]);
  
  // Popuni municipality automatski
  populateMunicipality();
});
</script>

<style scoped>
.field-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.field-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  background-color: #fafafa;
}

.field-expansion-modal {
  max-height: 90vh;
}

.field-expansion-modal .v-card {
  max-height: 85vh;
  overflow-y: auto;
}

.v-textarea {
  font-size: 16px;
}

.v-text-field {
  font-size: 16px;
}

/* Veliki prostor za unos teksta */
.v-textarea :deep(.v-field__input) {
  min-height: 200px;
  padding: 16px;
}

.v-text-field :deep(.v-field__input) {
  padding: 16px;
  font-size: 18px;
}
</style>