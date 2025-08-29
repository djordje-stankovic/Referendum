<template>
  <v-app>
    <!-- Modern App Bar with gradient -->
    <v-app-bar 
      elevation="0"
      class="modern-app-bar"
      height="70"
    >
      <v-container class="d-flex align-center">
        <div class="d-flex align-center">
          <v-icon 
            icon="mdi-lightbulb-on" 
            size="32" 
            color="primary" 
            class="mr-3"
          />
          <v-app-bar-title class="text-h5 font-weight-bold text-primary">
            Municipal Proposals
          </v-app-bar-title>
        </div>
        

        
        <v-spacer />
        
        <div class="d-flex align-center gap-3">
          <v-btn 
            variant="text" 
            :to="'/'"
            class="nav-btn"
            prepend-icon="mdi-home"
          >
            Home
          </v-btn

          <!-- Notifications with modern badge -->
          <v-btn 
            variant="text"
            @click="showNotifications = true"
            class="notification-btn"
            :color="hasUnreadNotifications ? 'error' : 'on-surface'"
          >
            <v-icon size="24">mdi-bell</v-icon>
            <v-badge
              v-if="unreadCount > 0"
              :content="unreadCount"
              color="error"
              dot
              location="top end"
              offset-x="8"
              offset-y="8"
            />
          </v-btn>

          <!-- User Menu -->
          <div class="user-menu-container">
            <v-btn 
              icon="mdi-account-circle" 
              variant="text"
              size="large"
              class="user-btn"
              @click="showUserMenu = !showUserMenu"
            />
            
            <!-- User Menu Dialog -->
            <v-dialog
              v-model="showUserMenu"
              :close-on-click-outside="true"
              :persistent="false"
              :retain-focus="false"
              :scrollable="false"
              :fullscreen="false"
              :overlay="false"
              class="user-menu-dialog"
              :style="userMenuStyle"
            >
              <v-card 
                class="user-menu" 
                elevation="12" 
                rounded="xl"
              >
                <v-list class="py-2">
                  <v-list-item 
                    :to="'/drafts'" 
                    title="My Drafts" 
                    prepend-icon="mdi-file-document-outline" 
                    class="menu-item"
                    rounded="lg"
                    density="comfortable"
                    @click="showUserMenu = false"
                  />
                  <v-list-item 
                    :to="'/profile'" 
                    title="Profile" 
                    prepend-icon="mdi-account" 
                    class="menu-item"
                    rounded="lg"
                    density="comfortable"
                    @click="showUserMenu = false"
                  />
                  <v-list-item 
                    :to="'/settings'" 
                    title="Settings" 
                    prepend-icon="mdi-cog" 
                    class="menu-item"
                    rounded="lg"
                    density="comfortable"
                    @click="showUserMenu = false"
                  />
                  <v-divider class="my-2 mx-3" />
                  <v-list-item 
                    title="Logout" 
                    prepend-icon="mdi-logout" 
                    @click="onLogout"
                    class="menu-item logout-item"
                    rounded="lg"
                    density="comfortable"
                  />
                </v-list>
              </v-card>
            </v-dialog>
          </div>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb-container">
      <v-container class="py-2">
        <v-breadcrumbs
          :items="breadcrumbItems"
          class="breadcrumb-nav"
        >
          <template #divider>
            <v-icon icon="mdi-chevron-right" size="small" />
          </template>
        </v-breadcrumbs>
      </v-container>
    </div>

    <!-- Main content with gradient background -->
    <v-main class="main-content">
      <v-container class="py-8 px-6">
        <router-view />
      </v-container>
    </v-main>

    <!-- Modern Notifications Dialog -->
    <v-dialog v-model="showNotifications" max-width="600" persistent>
      <v-card class="notification-dialog" elevation="12" rounded="xl">
        <v-card-title class="d-flex align-center pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary" size="28">mdi-bell</v-icon>
            <span class="text-h6 font-weight-bold">Notifications</span>
          </div>
          <v-spacer />
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            @click="showNotifications = false"
            size="small"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6 pt-4">
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
       const showUserMenu = ref(false);
       const notifications = ref([]);
       const unreadCount = ref(0);
       const showEditModal = ref(false);
       const selectedContributionId = ref(null);
       const selectedProposalId = ref(null);


    const hasUnreadNotifications = computed(() => unreadCount.value > 0);

    // Breadcrumb navigation
    const breadcrumbItems = computed(() => {
      const currentRoute = router.currentRoute.value;
      const items = [
        {
          title: 'Home',
          to: '/',
          disabled: currentRoute.path === '/'
        }
      ];

      if (currentRoute.path.startsWith('/proposal/')) {
        items.push({
          title: 'Proposals',
          to: '/',
          disabled: false
        });
        items.push({
          title: 'Proposal Details',
          to: currentRoute.path,
          disabled: true
        });
      } else if (currentRoute.path === '/create') {
        items.push({
          title: 'Create Proposal',
          to: currentRoute.path,
          disabled: true
        });
      } else if (currentRoute.path === '/drafts') {
        items.push({
          title: 'My Drafts',
          to: currentRoute.path,
          disabled: true
        });
      } else if (currentRoute.path === '/profile') {
        items.push({
          title: 'Profile',
          to: currentRoute.path,
          disabled: true
        });
      } else if (currentRoute.path === '/settings') {
        items.push({
          title: 'Settings',
          to: currentRoute.path,
          disabled: true
        });
      }

      return items;
    });

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
      
      // Listen for window resize to reposition menu
      window.addEventListener('resize', () => {
        if (showUserMenu.value) {
          // Force menu repositioning
          showUserMenu.value = false;
          setTimeout(() => {
            showUserMenu.value = true;
          }, 10);
        }
      });
    });

               // User menu positioning
               const userMenuStyle = computed(() => {
                 // Get the user button position
                 const userBtn = document.querySelector('.user-btn');
                 if (userBtn) {
                   const rect = userBtn.getBoundingClientRect();
                   return {
                     position: 'fixed',
                     top: `${rect.bottom + 8}px`,
                     right: `${window.innerWidth - rect.right}px`,
                     zIndex: 9999,
                     minWidth: '200px',
                     transform: 'none'
                   };
                 }
                 // Fallback positioning
                 return {
                   position: 'fixed',
                   top: '80px',
                   right: '24px',
                   zIndex: 9999,
                   minWidth: '200px',
                   transform: 'none'
                 };
               });

             return {
             showNotifications,
             showUserMenu,
             userMenuStyle,
             notifications,
             unreadCount,
             hasUnreadNotifications,
             fetchNotifications,
             onLogout,
             showEditModal,
             selectedContributionId,
             selectedProposalId,
             handleEditProcessed,
             breadcrumbItems
                      };
         }
       };
</script>

<style>
html, body, #app {
  height: 100%;
}

/* Modern App Bar Styles */
.modern-app-bar {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-app-bar .v-toolbar-title {
  color: white !important;
}

/* Navigation Button Styles */
.nav-btn {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  color: white !important;
  transform: translateY(-1px);
}

.create-btn {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) !important;
  color: white !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3) !important;
}

/* Notification Button */
.notification-btn {
  position: relative;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  transform: scale(1.1);
}

/* User Button */
.user-btn {
  color: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s ease;
}

.user-btn:hover {
  color: white !important;
  transform: scale(1.1);
}

/* User Menu */
.user-menu-container {
  z-index: 9999 !important;
}

.user-menu {
  border: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  min-width: 200px;
  position: relative !important;
  z-index: 9999 !important;
  transform: none !important;
}

.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background-color: rgba(99, 102, 241, 0.1) !important;
  transform: translateX(4px);
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1) !important;
  transform: translateX(4px);
}

/* User Menu Dialog */
.user-menu-dialog {
  z-index: 9999 !important;
}

.user-menu-dialog .v-dialog__container {
  position: fixed !important;
  transform: none !important;
}

.user-menu-dialog .v-dialog__content {
  position: fixed !important;
  transform: none !important;
  margin: 0 !important;
  max-width: none !important;
  width: auto !important;
}

.user-menu {
  position: relative !important;
  transform: none !important;
  margin: 0 !important;
  min-width: 200px !important;
}

/* Ensure menu appears on the right side */
.user-menu-container {
  position: relative;
}

.user-menu-container .v-dialog {
  position: fixed !important;
}

/* Menu items styling */
.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background-color: rgba(99, 102, 241, 0.1) !important;
  transform: translateX(4px);
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1) !important;
  transform: translateX(4px);
}

/* Fix menu positioning */
.v-menu__content {
  position: fixed !important;
  transform: none !important;
}

.v-menu__content .v-card {
  position: relative !important;
  transform: none !important;
}

/* Main Content */
.main-content {
  background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
  min-height: calc(100vh - 70px);
}

/* Breadcrumb Navigation */
.breadcrumb-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 70px;
  z-index: 100;
}

.breadcrumb-nav {
  padding: 8px 0;
}

.breadcrumb-nav .v-breadcrumbs-item {
  font-size: 0.875rem;
  color: #6B7280;
}

.breadcrumb-nav .v-breadcrumbs-item--disabled {
  color: #374151;
  font-weight: 500;
}

/* Notification Dialog */
.notification-dialog {
  border: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-app-bar {
    height: 60px !important;
  }
  
  .breadcrumb-container {
    top: 60px;
  }
  
  .main-content {
    min-height: calc(100vh - 60px);
  }
  
  .v-container {
    padding: 16px !important;
  }
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
