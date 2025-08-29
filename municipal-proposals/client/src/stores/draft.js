import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useDraftStore = defineStore('draft', () => {
  const authStore = useAuthStore();
  const drafts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed properties
  const hasDrafts = computed(() => drafts.value.length > 0);
  const draftsCount = computed(() => drafts.value.length);

  // Get all drafts for current user
  const fetchDrafts = async () => {
    if (!authStore.currentUser?.id) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${authStore.baseUrl}/api/drafts/${authStore.currentUser.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }
      
      drafts.value = await response.json();
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching drafts:', err);
    } finally {
      loading.value = false;
    }
  };

  // Get specific draft by ID
  const fetchDraft = async (draftId) => {
    if (!authStore.currentUser?.id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${authStore.baseUrl}/api/drafts/${authStore.currentUser.id}/${draftId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch draft');
      }
      
      return await response.json();
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching draft:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Save draft (create or update)
  const saveDraft = async (draftData) => {
    if (!authStore.currentUser?.id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const payload = {
        ...draftData,
        author_id: authStore.currentUser.id
      };
      
      const response = await fetch(`${authStore.baseUrl}/api/drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save draft');
      }
      
      const savedDraft = await response.json();
      
      // Update local state
      if (draftData.draft_id) {
        // Update existing draft
        const index = drafts.value.findIndex(d => d.id === draftData.draft_id);
        if (index !== -1) {
          drafts.value[index] = savedDraft;
        }
      } else {
        // Add new draft
        drafts.value.unshift(savedDraft);
      }
      
      return savedDraft;
    } catch (err) {
      error.value = err.message;
      console.error('Error saving draft:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Delete draft
  const deleteDraft = async (draftId) => {
    if (!authStore.currentUser?.id) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${authStore.baseUrl}/api/drafts/${authStore.currentUser.id}/${draftId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete draft');
      }
      
      // Remove from local state
      drafts.value = drafts.value.filter(d => d.id !== draftId);
      
      return true;
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting draft:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Convert draft to proposal
  const convertDraftToProposal = async (draftId) => {
    if (!authStore.currentUser?.id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${authStore.baseUrl}/api/drafts/${authStore.currentUser.id}/${draftId}/convert`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert draft to proposal');
      }
      
      const result = await response.json();
      
      // Remove draft from local state
      drafts.value = drafts.value.filter(d => d.id !== draftId);
      
      return result.proposal;
    } catch (err) {
      error.value = err.message;
      console.error('Error converting draft to proposal:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  // Clear all data
  const clearDrafts = () => {
    drafts.value = [];
    error.value = null;
  };

  return {
    // State
    drafts,
    loading,
    error,
    
    // Computed
    hasDrafts,
    draftsCount,
    
    // Actions
    fetchDrafts,
    fetchDraft,
    saveDraft,
    deleteDraft,
    convertDraftToProposal,
    clearError,
    clearDrafts,
  };
});
