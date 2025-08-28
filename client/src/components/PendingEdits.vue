<template>
  <div class="pending-edits-container">
    <v-card class="pending-edits-card">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-pencil-clock</v-icon>
        Pending Edits
        <v-chip 
          v-if="pendingEdits.length > 0" 
          color="warning" 
          class="ml-2"
          small
        >
          {{ pendingEdits.length }}
        </v-chip>
      </v-card-title>
      
            <v-card-text>
        <div v-if="loading" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        
        <div v-else-if="pendingEdits.length === 0" class="text-center text-muted">
          <v-icon size="48" color="grey">mdi-check-circle</v-icon>
          <p class="mt-2">No pending edits</p>
        </div>
        
        <div v-else>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="edit in pendingEdits"
              :key="edit.id"
              class="mb-2"
            >
                             <v-expansion-panel-header>
                 <div class="d-flex align-center justify-space-between w-100">
                   <div class="d-flex align-center">
                     <v-avatar size="32" class="mr-3">
                       <v-icon>mdi-account</v-icon>
                     </v-avatar>
                     <div>
                       <div class="font-weight-medium">
                         {{ edit.users?.username || 'Unknown User' }}
                       </div>
                       <div class="text-caption">
                         {{ formatDate(edit.created_at) }}
                       </div>
                     </div>
                   </div>
                   <div class="text-right">
                     <v-chip color="warning" size="small" class="mb-1">
                       {{ edit.field_changes.length }} change(s)
                     </v-chip>
                     <div class="text-caption text-muted">
                       {{ edit.change_summary }}
                     </div>
                   </div>
                 </div>
               </v-expansion-panel-header>
              
                             <v-expansion-panel-content>
                 <div class="edit-details">
                   <!-- Show all field changes for this edit session -->
                   <div v-for="change in edit.field_changes" :key="change.field_name" class="edit-field mb-3">
                     <div class="text-subtitle-2 mb-1">Field: {{ formatFieldName(change.field_name) }}</div>
                     <v-card outlined class="pa-3">
                       <div class="d-flex">
                         <div class="flex-grow-1">
                           <div class="text-caption text-muted mb-1">Old Value:</div>
                           <div class="old-value">{{ change.old_value || 'Empty' }}</div>
                         </div>
                         <v-divider vertical class="mx-3"></v-divider>
                         <div class="flex-grow-1">
                           <div class="text-caption text-muted mb-1">New Value:</div>
                           <div class="new-value">{{ change.new_value || 'Empty' }}</div>
                         </div>
                       </div>
                     </v-card>
                   </div>
                   
                   <div v-if="edit.field_changes[0]?.edit_summary" class="edit-summary mb-3">
                     <div class="text-subtitle-2 mb-1">Edit Summary:</div>
                     <v-card outlined class="pa-3">
                       {{ edit.field_changes[0].edit_summary }}
                     </v-card>
                   </div>
                   
                                       <div class="d-flex justify-end gap-2 mt-4">
                      <v-btn
                        color="info"
                        outlined
                        size="small"
                        @click="openEditForm(edit)"
                      >
                        <v-icon left>mdi-eye</v-icon>
                        View All Changes
                      </v-btn>
                      <v-btn
                        color="error"
                        outlined
                        size="small"
                        @click="rejectEdit(edit.id)"
                        :loading="rejecting === edit.id"
                      >
                        <v-icon left>mdi-close</v-icon>
                        Reject All Changes
                      </v-btn>
                      <v-btn
                        color="success"
                        size="small"
                        @click="approveEdit(edit.id)"
                        :loading="approving === edit.id"
                      >
                        <v-icon left>mdi-check</v-icon>
                        Approve All Changes
                      </v-btn>
                    </div>
                 </div>
               </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
                 </div>
       </v-card-text>
     </v-card>

     <!-- Modal za prikaz svih predloženih promena -->
     <v-dialog v-model="showEditModal" max-width="800" persistent>
       <v-card>
         <v-card-title class="d-flex align-center">
           <v-icon class="mr-2">mdi-eye</v-icon>
           Review Proposed Changes
           <v-spacer></v-spacer>
           <v-btn icon @click="showEditModal = false">
             <v-icon>mdi-close</v-icon>
           </v-btn>
         </v-card-title>
         
         <v-card-text v-if="selectedEdit">
           <div class="mb-4">
             <div class="text-subtitle-2 mb-2">Proposed by: {{ selectedEdit.users?.full_name }}</div>
             <div class="text-caption text-muted">Date: {{ formatDate(selectedEdit.created_at) }}</div>
           </div>
           
           <v-divider class="mb-4"></v-divider>
           
           <!-- Prikaz svih field changes -->
           <div v-for="change in selectedEdit.field_changes" :key="change.field_name" class="mb-4">
             <div class="text-subtitle-2 mb-2">{{ formatFieldName(change.field_name) }}</div>
             <v-card outlined class="pa-3">
               <div class="d-flex">
                 <div class="flex-grow-1">
                   <div class="text-caption text-muted mb-1">Current Value:</div>
                   <div class="current-value pa-2 bg-grey-lighten-4 rounded">{{ change.old_value || 'Empty' }}</div>
                 </div>
                 <v-divider vertical class="mx-3"></v-divider>
                 <div class="flex-grow-1">
                   <div class="text-caption text-muted mb-1">Proposed Value:</div>
                   <div class="proposed-value pa-2 bg-blue-lighten-5 rounded">{{ change.new_value || 'Empty' }}</div>
                 </div>
               </div>
             </v-card>
           </div>
           
           <div v-if="selectedEdit.field_changes[0]?.edit_summary" class="mt-4">
             <div class="text-subtitle-2 mb-2">Edit Summary:</div>
             <v-card outlined class="pa-3 bg-grey-lighten-4">
               {{ selectedEdit.field_changes[0].edit_summary }}
             </v-card>
           </div>
         </v-card-text>
         
         <v-card-actions class="pa-4">
           <v-spacer></v-spacer>
           <v-btn
             color="error"
             outlined
             @click="rejectEdit(selectedEdit?.id); showEditModal = false"
             :loading="rejecting === selectedEdit?.id"
           >
             <v-icon left>mdi-close</v-icon>
             Reject All Changes
           </v-btn>
           <v-btn
             color="success"
             @click="approveEdit(selectedEdit?.id); showEditModal = false"
             :loading="approving === selectedEdit?.id"
           >
             <v-icon left>mdi-check</v-icon>
             Approve All Changes
           </v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
   </div>
 </template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'PendingEdits',
  props: {
    proposalId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const authStore = useAuthStore();
    const pendingEdits = ref([]);
    const loading = ref(false);
    const approving = ref(null);
    const rejecting = ref(null);
    const showEditModal = ref(false);
    const selectedEdit = ref(null);
    
    const fetchPendingEdits = async () => {
      loading.value = true;
      try {
        const response = await fetch(`${authStore.baseUrl}/api/proposals/${props.proposalId}/pending-edits`);
        if (response.ok) {
          pendingEdits.value = await response.json();
        }
      } catch (error) {
        console.error('Error fetching pending edits:', error);
      } finally {
        loading.value = false;
      }
    };

    const approveEdit = async (contributionId) => {
      if (!authStore.currentUser?.id) return;
      
      approving.value = contributionId;
      try {
        const response = await fetch(`${authStore.baseUrl}/api/proposals/${props.proposalId}/contributions/${contributionId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'approved',
            userId: authStore.currentUser.id
          })
        });
        
        if (response.ok) {
          // Remove approved edit from list
          pendingEdits.value = pendingEdits.value.filter(edit => edit.id !== contributionId);
          // Emit event to parent component to refresh data
          window.dispatchEvent(new CustomEvent('edit-approved', { detail: { contributionId } }));
        }
      } catch (error) {
        console.error('Error approving edit:', error);
      } finally {
        approving.value = null;
      }
    };
    
    const rejectEdit = async (contributionId) => {
      if (!authStore.currentUser?.id) return;
      
      rejecting.value = contributionId;
      try {
        const response = await fetch(`${authStore.baseUrl}/api/proposals/${props.proposalId}/contributions/${contributionId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'rejected',
            userId: authStore.currentUser.id
          })
        });
        
        if (response.ok) {
          // Remove rejected edit from list
          pendingEdits.value = pendingEdits.value.filter(edit => edit.id !== contributionId);
          // Emit event to parent component to refresh data
          window.dispatchEvent(new CustomEvent('edit-rejected', { detail: { contributionId } }));
        }
      } catch (error) {
        console.error('Error rejecting edit:', error);
      } finally {
        rejecting.value = null;
      }
    };

    const openEditForm = (edit) => {
      selectedEdit.value = edit;
      showEditModal.value = true;
    };
    

    

    
    const formatFieldName = (fieldName) => {
      const fieldNames = {
        'title': 'Title',
        'summary': 'Summary',
        'problem_description': 'Problem Description',
        'proposed_solution': 'Proposed Solution',
        'estimated_cost': 'Estimated Cost',
        'expected_impact': 'Expected Impact'
      };
      return fieldNames[fieldName] || fieldName;
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    

    
    onMounted(() => {
      fetchPendingEdits();
    });
    
    return {
      pendingEdits,
      loading,
      approving,
      rejecting,
      showEditModal,
      selectedEdit,
      approveEdit,
      rejectEdit,
      openEditForm,
      formatFieldName,
      formatDate
    };
  }
};
</script>

<style scoped>
.pending-edits-container {
  max-width: 800px;
  margin: 0 auto;
}

.pending-edits-card {
  margin: 16px;
}

.edit-details {
  padding: 16px 0;
}

.edit-field .old-value {
  color: #d32f2f;
  font-weight: 500;
}

.edit-field .new-value {
  color: #388e3c;
  font-weight: 500;
}

.edit-summary {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.text-muted {
  color: #6c757d;
}

.current-value {
  color: #666;
  font-family: monospace;
  border-left: 3px solid #ccc;
}

.proposed-value {
  color: #1976d2;
  font-family: monospace;
  border-left: 3px solid #2196f3;
}

</style>
