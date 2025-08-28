<template>
  <v-dialog v-model="showModal" max-width="1200" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="warning">mdi-pencil</v-icon>
        Pregled predloženih izmena
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Učitavanje detalja izmene...</p>
      </v-card-text>

      <v-card-text v-else-if="editDetails && proposalData">
        <!-- Header info -->
        <v-alert type="info" variant="tonal" class="mb-6">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <div>
              <strong>{{ editDetails.user_name }}</strong> je predložio izmene za predlog 
              <strong>"{{ editDetails.proposal_title }}"</strong>
              <br>
              <small class="text-caption">{{ formatDate(editDetails.created_at) }}</small>
            </div>
          </div>
        </v-alert>

        <!-- Form fields -->
        <v-form @submit.prevent="acceptEdit">
          <v-row>
            <!-- Title -->
            <v-col cols="12">
              <v-text-field
                v-model="proposalData.title"
                label="Naslov predloga"
                :class="getFieldClass('title')"
                readonly
                variant="outlined"
                density="compact"
              >
                <template #append>
                  <v-chip v-if="isFieldChanged('title')" color="warning" size="small">
                    <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                    Izmena
                  </v-chip>
                </template>
              </v-text-field>
            </v-col>

            <!-- Summary -->
            <v-col cols="12">
              <v-textarea
                v-model="proposalData.summary"
                label="Sažetak"
                :class="getFieldClass('summary')"
                readonly
                variant="outlined"
                density="compact"
                rows="3"
              >
                <template #append>
                  <v-chip v-if="isFieldChanged('summary')" color="warning" size="small">
                    <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                    Izmena
                  </v-chip>
                </template>
              </v-textarea>
            </v-col>

            <!-- Problem Description -->
            <v-col cols="12">
              <v-textarea
                v-model="proposalData.problem_description"
                label="Opis problema"
                :class="getFieldClass('problem_description')"
                readonly
                variant="outlined"
                density="compact"
                rows="4"
              >
                <template #append>
                  <v-chip v-if="isFieldChanged('problem_description')" color="warning" size="small">
                    <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                    Izmena
                  </v-chip>
                </template>
              </v-textarea>
            </v-col>

            <!-- Proposed Solution -->
            <v-col cols="12">
              <v-textarea
                v-model="proposalData.proposed_solution"
                label="Predloženo rešenje"
                :class="getFieldClass('proposed_solution')"
                readonly
                variant="outlined"
                density="compact"
                rows="4"
              >
                <template #append>
                  <v-chip v-if="isFieldChanged('proposed_solution')" color="warning" size="small">
                    <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                    Izmena
                  </v-chip>
                </template>
              </v-textarea>
            </v-col>

            <!-- Estimated Cost -->
            <v-col cols="6">
              <v-text-field
                v-model="proposalData.estimated_cost"
                label="Procenjena cena"
                :class="getFieldClass('estimated_cost')"
                readonly
                variant="outlined"
                density="compact"
              >
                <template #append>
                  <v-chip v-if="isFieldChanged('estimated_cost')" color="warning" size="small">
                    <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                    Izmena
                  </v-chip>
                </template>
              </v-text-field>
            </v-col>

            <!-- Expected Impact -->
            <v-col cols="6">
              <v-text-field
                v-model="proposalData.expected_impact"
                label="Očekivani uticaj"
                :class="getFieldClass('expected_impact')"
                readonly
                variant="outlined"
                density="compact"
              >
                <template #append>
                  <v-chip v-if="isFieldChanged('expected_impact')" color="warning" size="small">
                    <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
                    Izmena
                  </v-chip>
                </template>
              </v-text-field>
            </v-col>

            <!-- Edit Summary -->
            <v-col cols="12" v-if="editDetails.edit_summary">
              <v-card variant="outlined" class="bg-blue-lighten-5">
                <v-card-title class="text-subtitle-2 bg-blue-lighten-4">
                  <v-icon color="info" size="small" class="mr-2">mdi-information</v-icon>
                  Objašnjenje izmene od {{ editDetails.user_name }}
                </v-card-title>
                <v-card-text>
                  {{ editDetails.edit_summary }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn 
          color="error" 
          variant="outlined" 
          @click="rejectEdit"
          :loading="rejecting"
          :disabled="accepting"
          size="large"
        >
          <v-icon class="mr-2">mdi-close</v-icon>
          Odbij izmenu
        </v-btn>
        <v-btn 
          color="success" 
          @click="acceptEdit"
          :loading="accepting"
          :disabled="rejecting"
          size="large"
        >
          <v-icon class="mr-2">mdi-check</v-icon>
          Prihvati izmenu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'EditReviewForm',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    contributionId: {
      type: [String, Number],
      default: null
    },
    proposalId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['update:modelValue', 'edit-processed'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const showModal = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    const loading = ref(false);
    const editDetails = ref(null);
    const proposalData = ref(null);
    const accepting = ref(false);
    const rejecting = ref(false);

    const fetchEditDetails = async () => {
      if (!props.contributionId) return;
      
      loading.value = true;
      try {
        // Fetch edit details
        const editResponse = await fetch(`/proposals/edit-details/${props.contributionId}`);
        if (editResponse.ok) {
          editDetails.value = await editResponse.json();
        } else {
          console.error('Error fetching edit details');
          return;
        }

        // Fetch current proposal data
        const proposalResponse = await fetch(`/proposals/${props.proposalId}`);
        if (proposalResponse.ok) {
          const proposal = await proposalResponse.json();
          
          // Apply proposed changes to show the "new" version
          proposalData.value = { ...proposal };
          
          // Apply the proposed changes
          if (editDetails.value.changes) {
            editDetails.value.changes.forEach(change => {
              if (change.field_name && change.new_value) {
                proposalData.value[change.field_name] = change.new_value;
              }
            });
          }
        } else {
          console.error('Error fetching proposal data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        loading.value = false;
      }
    };

    const isFieldChanged = (fieldName) => {
      if (!editDetails.value?.changes) return false;
      return editDetails.value.changes.some(change => change.field_name === fieldName);
    };

    const getFieldClass = (fieldName) => {
      if (isFieldChanged(fieldName)) {
        return 'field-changed';
      }
      return '';
    };

    const acceptEdit = async () => {
      if (!props.contributionId) return;
      
      accepting.value = true;
      try {
        const response = await fetch(`/proposals/accept-edit/${props.contributionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: authStore.currentUser?.id
          })
        });
        
        if (response.ok) {
          emit('edit-processed', { action: 'accepted', contributionId: props.contributionId });
          closeModal();
        } else {
          console.error('Error accepting edit');
        }
      } catch (error) {
        console.error('Error accepting edit:', error);
      } finally {
        accepting.value = false;
      }
    };

    const rejectEdit = async () => {
      if (!props.contributionId) return;
      
      rejecting.value = true;
      try {
        const response = await fetch(`/proposals/reject-edit/${props.contributionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: authStore.currentUser?.id
          })
        });
        
        if (response.ok) {
          emit('edit-processed', { action: 'rejected', contributionId: props.contributionId });
          closeModal();
        } else {
          console.error('Error rejecting edit');
        }
      } catch (error) {
        console.error('Error rejecting edit:', error);
      } finally {
        rejecting.value = false;
      }
    };

    const closeModal = () => {
      emit('update:modelValue', false);
      editDetails.value = null;
      proposalData.value = null;
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

    watch(() => props.contributionId, (newId) => {
      if (newId && showModal.value) {
        fetchEditDetails();
      }
    });

    onMounted(() => {
      if (props.contributionId && showModal.value) {
        fetchEditDetails();
      }
    });

    return {
      showModal,
      loading,
      editDetails,
      proposalData,
      accepting,
      rejecting,
      acceptEdit,
      rejectEdit,
      closeModal,
      formatDate,
      isFieldChanged,
      getFieldClass
    };
  }
};
</script>

<style scoped>
.field-changed {
  background-color: #fff3e0 !important;
  border: 2px solid #ff9800 !important;
}

.field-changed .v-field__input {
  background-color: #fff3e0 !important;
}

.v-text-field.field-changed .v-field__outline {
  border-color: #ff9800 !important;
}

.v-textarea.field-changed .v-field__outline {
  border-color: #ff9800 !important;
}
</style>
