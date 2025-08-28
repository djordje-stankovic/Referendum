<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" dark>
      <v-app-bar-title>Municipal Proposals</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" :to="'/'">Home</v-btn>
      <v-btn color="secondary" :to="'/create'">Create</v-btn>

      <!-- Notifications -->
          <v-btn 
            variant="text"
            @click="showNotifications = true"
            :color="hasUnreadNotifications ? 'error' : 'white'"
          >
            <v-icon>mdi-bell</v-icon>
            <v-badge
              v-if="unreadCount > 0"
              :content="unreadCount"
              color="error"
              dot
            ></v-badge>
          </v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-account-circle" variant="text"></v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/profile'" title="Profile" prepend-icon="mdi-account" />
          <v-list-item :to="'/settings'" title="Settings" prepend-icon="mdi-cog" />
          <v-divider />
          <v-list-item title="Logout" prepend-icon="mdi-logout" @click="onLogout" />
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>

    <!-- Notifications Dialog -->
    <v-dialog v-model="showNotifications" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-bell</v-icon>
          Notifications
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showNotifications = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <Notifications />
        </v-card-text>
      </v-card>
    </v-dialog>
    
            <!-- Edit Review Form -->
        <EditReviewForm
          v-model="showEditModal"
          :contribution-id="selectedContributionId"
          :proposal-id="selectedProposalId"
          @edit-processed="handleEditProcessed"
        />
  </v-app>
  
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import Notifications from './components/Notifications.vue';
import EditReviewForm from './components/EditReviewForm.vue';

export default {
  name: 'App',
  components: {
    Notifications,
    EditReviewForm
  },
           setup() {
           const authStore = useAuthStore();
           const router = useRouter();
           const showNotifications = ref(false);
           const notifications = ref([]);
           const unreadCount = ref(0);
           const showEditModal = ref(false);
           const selectedContributionId = ref(null);
           const selectedProposalId = ref(null);

    const hasUnreadNotifications = computed(() => unreadCount.value > 0);

               const fetchNotifications = async () => {
             if (!authStore.currentUser?.id) return;

             try {
               const response = await fetch(`${authStore.baseUrl}/api/notifications/${authStore.currentUser.id}`);
               if (response.ok) {
                 notifications.value = await response.json();
                 unreadCount.value = notifications.value.filter(n => !n.is_read).length;
               }
             } catch (error) {
               console.error('Error fetching notifications:', error);
             }
           };

           const onLogout = () => {
             // Clear user data and redirect to login
             authStore.logout();
             router.push('/login');
           };

           const handleEditDetails = (event) => {
             const { contributionId, proposalId } = event.detail;
             selectedContributionId.value = contributionId;
             selectedProposalId.value = proposalId;
             showEditModal.value = true;
           };

           const handleEditProcessed = (result) => {
             // Refresh notifications after edit is processed
             fetchNotifications();
             
             // You can also emit an event to refresh proposal data if needed
             window.dispatchEvent(new CustomEvent('proposalUpdated', {
               detail: { action: result.action, contributionId: result.contributionId }
             }));
           };

    onMounted(() => {
      fetchNotifications();
      
      // Listen for edit details events
      window.addEventListener('showEditDetails', handleEditDetails);
      
      // Listen for user login events
      window.addEventListener('userLoggedIn', fetchNotifications);
    });

               return {
             showNotifications,
             notifications,
             unreadCount,
             hasUnreadNotifications,
             fetchNotifications,
             onLogout,
             showEditModal,
             selectedContributionId,
             selectedProposalId,
             handleEditProcessed
                      };
         }
       };
</script>

<style>
html, body, #app {
  height: 100%;
}
</style>
