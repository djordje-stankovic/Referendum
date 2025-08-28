<template>
  <v-container class="py-6">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 font-weight-bold pa-6 pb-4">
            <v-icon class="mr-3" color="primary" size="32">mdi-pencil</v-icon>
            {{ isReviewMode ? 'Review Proposed Changes' : 'Edit Proposal' }}: {{ proposal?.title || 'Loading...' }}
            <v-spacer></v-spacer>
            
            <!-- Review mode buttons -->
            <div v-if="isReviewMode" class="d-flex gap-3">
              <v-btn 
                color="error" 
                variant="outlined"
                @click="rejectChanges"
                :loading="rejecting"
                prepend-icon="mdi-close"
              >
                Reject Changes
              </v-btn>
              <v-btn 
                color="success" 
                @click="acceptChanges"
                :loading="accepting"
                prepend-icon="mdi-check"
              >
                Accept Changes
              </v-btn>
            </div>
            
            <!-- Edit mode button -->
            <v-btn 
              v-else
              color="primary" 
              variant="outlined"
              @click="saveChanges"
              :loading="loading"
              prepend-icon="mdi-content-save"
            >
              Submit Changes for Review
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pa-6 pt-0">
                         <!-- Review mode alert -->
             <v-alert v-if="isReviewMode" type="warning" variant="tonal" class="mb-6">
               <v-icon class="mr-2">mdi-eye</v-icon>
               <strong>Review Mode:</strong> You are reviewing changes proposed by {{ proposedChanges?.user_name || 'another user' }}. 
               Highlighted fields show the proposed changes. You can accept or reject these changes.
               
               <!-- Debug info -->
               <div class="mt-2 text-caption">
                 <strong>Debug:</strong> Contribution ID: {{ route.query.contribution }}, 
                 Changes: {{ proposedChanges?.changes?.length || 0 }}, 
                 User: {{ proposedChanges?.user_name }}
               </div>
             </v-alert>
            
            <!-- Edit mode alert -->
            <v-alert v-else type="info" variant="tonal" class="mb-6">
              <v-icon class="mr-2">mdi-information</v-icon>
              Click on any field to expand it for easier editing. All changes will be submitted for review by the proposal author.
            </v-alert>
            
            <v-form v-if="proposal" ref="formRef">
              <!-- Title -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card 
                    variant="outlined" 
                    :class="['pa-4 field-card', { 'proposed-change': isFieldProposed('title') }]"
                  >
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-h6 font-weight-medium text-primary">Title</h3>
                      <div class="d-flex align-center gap-2">
                        <v-chip 
                          v-if="isFieldProposed('title')" 
                          color="warning" 
                          size="small"
                          variant="outlined"
                        >
                          <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                          Proposed Change
                        </v-chip>
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
                    </div>
                    <div class="text-body-1">{{ formData.title || 'No title set' }}</div>
                    
                    <!-- Show proposed change if in review mode -->
                    <div v-if="isReviewMode && isFieldProposed('title')" class="mt-3">
                      <!-- Current value -->
                      <div class="p-3 bg-grey-lighten-5 rounded mb-2">
                        <div class="text-caption font-weight-medium text-grey-darken-1 mb-1">
                          <v-icon size="small" class="mr-1">mdi-information</v-icon>
                          Current value:
                        </div>
                        <div class="text-body-2 font-weight-medium text-grey-darken-2">
                          {{ getCurrentValue('title') }}
                        </div>
                      </div>
                      
                      <!-- Proposed change -->
                      <div class="p-3 bg-warning-lighten-5 rounded">
                        <div class="text-caption font-weight-medium text-warning-darken-1 mb-1">
                          <v-icon size="small" class="mr-1">mdi-arrow-up</v-icon>
                          Proposed by {{ proposedChanges?.user_name }}:
                        </div>
                        <div class="text-body-2 font-weight-medium text-warning-darken-2">
                          {{ getProposedValue('title') }}
                        </div>
                      </div>
                    </div>
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
                        Read-only
                      </v-chip>
                    </div>
                    <div class="text-body-1 font-weight-medium">{{ formData.municipality || 'No municipality set' }}</div>
                    <div class="text-caption text-medium-emphasis mt-2">
                      Municipality cannot be changed after proposal creation
                    </div>
                  </v-card>
                </v-col>
              </v-row>

                             <!-- Summary -->
               <v-row class="mb-6">
                 <v-col cols="12">
                   <v-card 
                     variant="outlined" 
                     :class="['pa-4 field-card', { 'proposed-change': isFieldProposed('summary') }]"
                   >
                     <div class="d-flex align-center justify-space-between mb-3">
                       <h3 class="text-h6 font-weight-medium text-primary">Summary</h3>
                       <div class="d-flex align-center gap-2">
                         <v-chip 
                           v-if="isFieldProposed('summary')" 
                           color="warning" 
                           size="small"
                           variant="outlined"
                         >
                           <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                           Proposed Change
                         </v-chip>
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
                     </div>
                     <div class="text-body-1">{{ formData.summary || 'No summary provided' }}</div>
                     
                     <!-- Show proposed change if in review mode -->
                     <div v-if="isReviewMode && isFieldProposed('summary')" class="mt-3">
                       <!-- Current value -->
                       <div class="p-3 bg-grey-lighten-5 rounded mb-2">
                         <div class="text-caption font-weight-medium text-grey-darken-1 mb-1">
                           <v-icon size="small" class="mr-1">mdi-information</v-icon>
                           Current value:
                         </div>
                         <div class="text-body-2 font-weight-medium text-grey-darken-2">
                           {{ getCurrentValue('summary') }}
                         </div>
                       </div>
                       
                       <!-- Proposed change -->
                       <div class="p-3 bg-warning-lighten-5 rounded">
                         <div class="text-caption font-weight-medium text-warning-darken-1 mb-1">
                           <v-icon size="small" class="mr-1">mdi-arrow-up</v-icon>
                           Proposed by {{ proposedChanges?.user_name }}:
                         </div>
                         <div class="text-body-2 font-weight-medium text-warning-darken-2">
                           {{ getProposedValue('summary') }}
                         </div>
                       </div>
                     </div>
                   </v-card>
                 </v-col>
               </v-row>

                             <!-- Problem -->
               <v-row class="mb-6">
                 <v-col cols="12">
                   <v-card 
                     variant="outlined" 
                     :class="['pa-4 field-card', { 'proposed-change': isFieldProposed('problem') }]"
                   >
                     <div class="d-flex align-center justify-space-between mb-3">
                       <h3 class="text-h6 font-weight-medium text-error">Problem Description</h3>
                       <div class="d-flex align-center gap-2">
                         <v-chip 
                           v-if="isFieldProposed('problem')" 
                           color="warning" 
                           size="small"
                           variant="outlined"
                         >
                           <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                           Proposed Change
                         </v-chip>
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
                     </div>
                     <div class="text-body-1">{{ formData.details?.problem || 'No problem description provided' }}</div>
                     
                     <!-- Show proposed change if in review mode -->
                     <div v-if="isReviewMode && isFieldProposed('problem')" class="mt-3 p-3 bg-warning-lighten-5 rounded">
                       <div class="text-caption font-weight-medium text-warning-darken-1 mb-1">
                         <v-icon size="small" class="mr-1">mdi-arrow-up</v-icon>
                         Proposed by {{ proposedChanges?.user_name }}:
                       </div>
                       <div class="text-body-2 font-weight-medium">
                         {{ getProposedValue('problem') }}
                       </div>
                     </div>
                   </v-card>
                 </v-col>
               </v-row>

                             <!-- Solution -->
               <v-row class="mb-6">
                 <v-col cols="12">
                   <v-card 
                     variant="outlined" 
                     :class="['pa-4 field-card', { 'proposed-change': isFieldProposed('solution') }]"
                   >
                     <div class="d-flex align-center justify-space-between mb-3">
                       <h3 class="text-h6 font-weight-medium text-success">Proposed Solution</h3>
                       <div class="d-flex align-center gap-2">
                         <v-chip 
                           v-if="isFieldProposed('solution')" 
                           color="warning" 
                           size="small"
                           variant="outlined"
                         >
                           <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                           Proposed Change
                         </v-chip>
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
                     </div>
                     <div class="text-body-1">{{ formData.details?.solution || 'No solution proposed' }}</div>
                     
                     <!-- Show proposed change if in review mode -->
                     <div v-if="isReviewMode && isFieldProposed('solution')" class="mt-3 p-3 bg-warning-lighten-5 rounded">
                       <div class="text-caption font-weight-medium text-warning-darken-1 mb-1">
                         <v-icon size="small" class="mr-1">mdi-arrow-up</v-icon>
                         Proposed by {{ proposedChanges?.user_name }}:
                       </div>
                       <div class="text-body-2 font-weight-medium">
                         {{ getProposedValue('solution') }}
                       </div>
                     </div>
                   </v-card>
                 </v-col>
               </v-row>

                             <!-- Cost -->
               <v-row class="mb-6">
                 <v-col cols="12">
                   <v-card 
                     variant="outlined" 
                     :class="['pa-4 field-card', { 'proposed-change': isFieldProposed('cost') }]"
                   >
                     <div class="d-flex align-center justify-space-between mb-3">
                       <h3 class="text-h6 font-weight-medium text-info">Estimated Cost</h3>
                       <div class="d-flex align-center gap-2">
                         <v-chip 
                           v-if="isFieldProposed('cost')" 
                           color="warning" 
                           size="small"
                           variant="outlined"
                         >
                           <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                           Proposed Change
                         </v-chip>
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
                     </div>
                     <div class="text-body-1">{{ formData.details?.cost || 'No cost estimate provided' }}</div>
                     
                     <!-- Show proposed change if in review mode -->
                     <div v-if="isReviewMode && isFieldProposed('cost')" class="mt-3 p-3 bg-warning-lighten-5 rounded">
                       <div class="text-caption font-weight-medium text-warning-darken-1 mb-1">
                         <v-icon size="small" class="mr-1">mdi-arrow-up</v-icon>
                         Proposed by {{ proposedChanges?.user_name }}:
                       </div>
                       <div class="text-body-2 font-weight-medium">
                         {{ getProposedValue('cost') }}
                       </div>
                     </div>
                   </v-card>
                 </v-col>
               </v-row>

                             <!-- Impact -->
               <v-row class="mb-6">
                 <v-col cols="12">
                   <v-card 
                     variant="outlined" 
                     :class="['pa-4 field-card', { 'proposed-change': isFieldProposed('impact') }]"
                   >
                     <div class="d-flex align-center justify-space-between mb-3">
                       <h3 class="text-h6 font-weight-medium text-warning">Expected Impact</h3>
                       <div class="d-flex align-center gap-2">
                         <v-chip 
                           v-if="isFieldProposed('impact')" 
                           color="warning" 
                           size="small"
                           variant="outlined"
                         >
                           <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                           Proposed Change
                         </v-chip>
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
                     </div>
                     <div class="text-body-1">{{ formData.details?.impact || 'No impact description provided' }}</div>
                     
                     <!-- Show proposed change if in review mode -->
                     <div v-if="isReviewMode && isFieldProposed('impact')" class="mt-3 p-3 bg-warning-lighten-5 rounded">
                       <div class="text-caption font-weight-medium text-warning-darken-1 mb-1">
                         <v-icon size="small" class="mr-1">mdi-arrow-up</v-icon>
                         Proposed by {{ proposedChanges?.user_name }}:
                       </div>
                       <div class="text-body-2 font-weight-medium">
                         {{ getProposedValue('impact') }}
                       </div>
                     </div>
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
                      <div class="text-subtitle-2 mb-2">Current attachments:</div>
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

            <div v-else class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <div class="mt-4 text-h6">Loading proposal data...</div>
            </div>
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
          Edit {{ getFieldLabel(expandedField) }}
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
              size="x-large"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
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
  municipality: '',
  summary: '',
  details: { 
    problem: '', 
    solution: '', 
    cost: '', 
    impact: '' 
  },
  attachments: [],
});

// Review mode variables
const isReviewMode = ref(false);
const proposedChanges = ref(null);
const accepting = ref(false);
const rejecting = ref(false);

const proposal = computed(() => 
  store.proposals.find(p => p.proposalId === parseInt(route.params.id))
);

const municipalities = computed(() => store.municipalities);

// Popuni form sa postojećim podacima
const populateForm = () => {
  if (proposal.value) {
    formData.value = {
      title: proposal.value.title || '',
      municipality: proposal.value.municipality || '',
      summary: proposal.value.summary || '',
      details: {
        problem: proposal.value.details?.problem || '',
        solution: proposal.value.details?.solution || '',
        cost: proposal.value.details?.cost || '',
        impact: proposal.value.details?.impact || ''
      },
      attachments: proposal.value.attachments || []
    };
  }
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

// Save all changes
const saveChanges = async () => {
  loading.value = true;
  try {
    // Prepare edit data for the new system
    const editData = {
      title: formData.value.title,
      summary: formData.value.summary,
      problem_description: formData.value.details.problem,
      proposed_solution: formData.value.details.solution,
      estimated_cost: formData.value.details.cost,
      expected_impact: formData.value.details.impact,
      edit_summary: 'Proposal edit proposed'
    };

    // Check if there are any changes
    const hasChanges = 
      formData.value.title !== proposal.value.title ||
      formData.value.summary !== proposal.value.summary ||
      formData.value.details.problem !== proposal.value.details?.problem ||
      formData.value.details.solution !== proposal.value.details?.solution ||
      formData.value.details.cost !== proposal.value.details?.cost ||
      formData.value.details.impact !== proposal.value.details?.impact;

    if (!hasChanges) {
      alert('No changes detected. Please make some changes before submitting.');
      return;
    }

    // Submit edit proposal using the new system
    const response = await fetch(`http://localhost:3000/api/proposals/${route.params.id}/propose-edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: authStore.currentUser?.id,
        editData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit edit proposal');
    }

    // Show success message
    alert('Edit proposal submitted successfully! The proposal author will be notified and can approve or reject your changes.');
    
    // Navigate back to proposal view
    router.push(`/proposal/${route.params.id}`);
    
  } catch (error) {
    console.error('Error saving changes:', error);
    alert('Error submitting edit proposal. Please try again.');
  } finally {
    loading.value = false;
  }
};



// Helper functions for field display
const getFieldLabel = (field) => {
  const labels = {
    title: 'Title',
    municipality: 'Municipality',
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
    municipality: 'mdi-city',
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
    municipality: 'primary',
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
    store.fetchProposals(),
    store.fetchMunicipalities()
  ]);
  
  // Popuni form
  populateForm();
  
  // Check if we're in review mode
  checkReviewMode();
});

// Check if we're in review mode (URL has contribution parameter)
const checkReviewMode = async () => {
  const contributionId = route.query.contribution;
  if (contributionId) {
    isReviewMode.value = true;
    await fetchProposedChanges(contributionId);
  }
};

// Fetch proposed changes
const fetchProposedChanges = async (contributionId) => {
  try {
    console.log('Fetching proposed changes for contribution:', contributionId);
    const response = await fetch(`${authStore.baseUrl}/api/proposals/edit-details/${contributionId}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Received proposed changes:', data);
      proposedChanges.value = data;
      
      // Apply proposed changes to form data to show the "new" version
      if (data.changes) {
        data.changes.forEach(change => {
          if (change.field_name === 'title') {
            formData.value.title = change.new_value;
          } else if (change.field_name === 'summary') {
            formData.value.summary = change.new_value;
          } else if (change.field_name === 'problem_description') {
            formData.value.details.problem = change.new_value;
          } else if (change.field_name === 'proposed_solution') {
            formData.value.details.solution = change.new_value;
          } else if (change.field_name === 'estimated_cost') {
            formData.value.details.cost = change.new_value;
          } else if (change.field_name === 'expected_impact') {
            formData.value.details.impact = change.new_value;
          }
        });
      }
    } else {
      console.error('Failed to fetch proposed changes:', response.status);
    }
  } catch (error) {
    console.error('Error fetching proposed changes:', error);
  }
};

// Check if a field has proposed changes
const isFieldProposed = (fieldName) => {
  if (!proposedChanges.value?.changes) return false;
  
  // Map frontend field names to backend field names
  const fieldMapping = {
    'title': 'title',
    'summary': 'summary',
    'problem': 'problem_description',
    'solution': 'proposed_solution',
    'cost': 'estimated_cost',
    'impact': 'expected_impact'
  };
  
  const backendFieldName = fieldMapping[fieldName];
  if (!backendFieldName) return false;
  
  return proposedChanges.value.changes.some(change => change.field_name === backendFieldName);
};

// Get proposed value for a field
const getProposedValue = (fieldName) => {
  if (!proposedChanges.value?.changes) return '';
  
  // Map frontend field names to backend field names
  const fieldMapping = {
    'title': 'title',
    'summary': 'summary',
    'problem': 'problem_description',
    'solution': 'proposed_solution',
    'cost': 'estimated_cost',
    'impact': 'expected_impact'
  };
  
  const backendFieldName = fieldMapping[fieldName];
  if (!backendFieldName) return '';
  
  const change = proposedChanges.value.changes.find(c => c.field_name === backendFieldName);
  return change?.new_value || '';
};

// Get current value for a field (before proposed changes)
const getCurrentValue = (fieldName) => {
  if (!proposedChanges.value?.changes) return '';
  
  // Map frontend field names to backend field names
  const fieldMapping = {
    'title': 'title',
    'summary': 'summary',
    'problem': 'problem_description',
    'solution': 'proposed_solution',
    'cost': 'estimated_cost',
    'impact': 'expected_impact'
  };
  
  const backendFieldName = fieldMapping[fieldName];
  if (!backendFieldName) return '';
  
  const change = proposedChanges.value.changes.find(c => c.field_name === backendFieldName);
  return change?.current_value || change?.old_value || '';
};

// Accept proposed changes
const acceptChanges = async () => {
  if (!proposedChanges.value) return;
  
  accepting.value = true;
  try {
          const response = await fetch(`${authStore.baseUrl}/api/proposals/accept-edit/${proposedChanges.value.contribution_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: authStore.currentUser?.id
      })
    });
    
    if (response.ok) {
      // Show success message
      alert('Changes accepted successfully! The user has been added as a contributor.');
      
      // Refresh proposal data to show updated values
      await store.fetchProposals();
      
      // Dispatch custom event to refresh notifications
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
      
      // Exit review mode
      isReviewMode.value = false;
      proposedChanges.value = null;
      
      // Redirect back to proposal view
      router.push(`/proposal/${route.params.id}`);
    } else {
      throw new Error('Failed to accept changes');
    }
  } catch (error) {
    console.error('Error accepting changes:', error);
    alert('Error accepting changes. Please try again.');
  } finally {
    accepting.value = false;
  }
};

// Reject proposed changes
const rejectChanges = async () => {
  if (!proposedChanges.value) return;
  
  rejecting.value = true;
  try {
          const response = await fetch(`${authStore.baseUrl}/api/proposals/reject-edit/${proposedChanges.value.contribution_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: authStore.currentUser?.id
      })
    });
    
    if (response.ok) {
      // Show success message
      alert('Changes rejected successfully!');
      
      // Dispatch custom event to refresh notifications
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
      
      // Exit review mode
      isReviewMode.value = false;
      proposedChanges.value = null;
      
      // Redirect back to proposal view
      router.push(`/proposal/${route.params.id}`);
    } else {
      throw new Error('Failed to reject changes');
    }
  } catch (error) {
    console.error('Error rejecting changes:', error);
    alert('Error rejecting changes. Please try again.');
  } finally {
    rejecting.value = false;
  }
};

// Watch za promene u proposal-u
watch(proposal, () => {
  populateForm();
}, { deep: true });

// Return all necessary functions and variables
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

.proposed-change {
  border: 2px solid #ff9800 !important;
  background-color: #fff3e0 !important;
}

.proposed-change:hover {
  border-color: #f57c00 !important;
  background-color: #ffe0b2 !important;
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


