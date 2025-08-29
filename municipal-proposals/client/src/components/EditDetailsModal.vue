<template>
  <v-dialog v-model="showModal" max-width="900" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="warning">mdi-pencil</v-icon>
        Pregled predložene izmene
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Učitavanje detalja izmene...</p>
      </v-card-text>

      <v-card-text v-else-if="editDetails">
        <div class="mb-4">
          <v-alert type="info" variant="tonal">
            <strong>{{ editDetails.user_name }}</strong> je predložio izmene za predlog 
            <strong>"{{ editDetails.proposal_title }}"</strong>
          </v-alert>
        </div>

        <div v-for="change in editDetails.changes" :key="change.field_name" class="mb-6">
          <h3 class="text-h6 mb-3 text-capitalize">
            {{ getFieldDisplayName(change.field_name) }}
          </h3>
          
          <v-row>
            <v-col cols="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-2 bg-red-lighten-5">
                  <v-icon color="error" size="small" class="mr-2">mdi-minus</v-icon>
                  Trenutni tekst
                </v-card-title>
                <v-card-text class="text-body-2">
                  <div class="old-text">{{ change.old_value || 'Nema sadržaja' }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-2 bg-green-lighten-5">
                  <v-icon color="success" size="small" class="mr-2">mdi-plus</v-icon>
                  Predloženi tekst
                </v-card-title>
                <v-card-text class="text-body-2">
                  <div class="new-text">{{ change.new_value || 'Nema sadržaja' }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-if="editDetails.edit_summary" class="mt-4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-2 bg-blue-lighten-5">
              <v-icon color="info" size="small" class="mr-2">mdi-information</v-icon>
              Objašnjenje izmene
            </v-card-title>
            <v-card-text>
              {{ editDetails.edit_summary }}
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn 
          color="error" 
          variant="outlined" 
          @click="rejectEdit"
          :loading="rejecting"
          :disabled="accepting"
        >
          <v-icon class="mr-2">mdi-close</v-icon>
          Odbij izmenu
        </v-btn>
        <v-btn 
          color="success" 
          @click="acceptEdit"
          :loading="accepting"
          :disabled="rejecting"
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
  name: 'EditDetailsModal',
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
    const accepting = ref(false);
    const rejecting = ref(false);

    const fetchEditDetails = async () => {
      if (!props.contributionId) return;
      
      loading.value = true;
      try {
        const response = await fetch(`/proposals/edit-details/${props.contributionId}`);
        if (response.ok) {
          editDetails.value = await response.json();
        } else {
          console.error('Error fetching edit details');
        }
      } catch (error) {
        console.error('Error fetching edit details:', error);
      } finally {
        loading.value = false;
      }
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
          // Emit event to refresh proposal data
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
          // Emit event to refresh proposal data
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
    };

    const getFieldDisplayName = (fieldName) => {
      const fieldNames = {
        'title': 'Naslov',
        'summary': 'Sažetak',
        'problem_description': 'Opis problema',
        'proposed_solution': 'Predloženo rešenje',
        'estimated_cost': 'Procenjena cena',
        'expected_impact': 'Očekivani uticaj'
      };
      return fieldNames[fieldName] || fieldName;
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
      accepting,
      rejecting,
      acceptEdit,
      rejectEdit,
      closeModal,
      getFieldDisplayName
    };
  }
};
</script>

<style scoped>
.old-text {
  background-color: #ffebee;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #f44336;
  white-space: pre-wrap;
  word-break: break-word;
}

.new-text {
  background-color: #e8f5e8;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #4caf50;
  white-space: pre-wrap;
  word-break: break-word;
}

.h-100 {
  height: 100%;
}
</style>
