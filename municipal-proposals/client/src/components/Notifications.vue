<template>
  <div class="notifications-container">
    <v-card class="notifications-card">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-bell</v-icon>
        Notifications
        <v-chip 
          v-if="unreadCount > 0" 
          color="error" 
          class="ml-2"
          small
        >
          {{ unreadCount }}
        </v-chip>
      </v-card-title>
      
      <v-card-text>
        <div v-if="loading" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        
        <div v-else-if="notifications.length === 0" class="text-center text-muted">
          <v-icon size="48" color="grey">mdi-bell-off</v-icon>
          <p class="mt-2">No notifications yet</p>
        </div>
        
        <div v-else>
          <v-list>
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'unread': !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
                             <v-list-item-prepend>
                 <v-avatar size="32">
                   <v-icon 
                     :color="getNotificationIconColor(notification.type)"
                     size="24"
                   >
                     {{ getNotificationIcon(notification.type) }}
                   </v-icon>
                 </v-avatar>
               </v-list-item-prepend>
               
               <v-list-item-title 
                 :class="{ 'font-weight-bold': !notification.is_read }"
               >
                 {{ notification.title }}
               </v-list-item-title>
               <v-list-item-subtitle>
                 {{ notification.message }}
                 <span v-if="notification.proposals?.title" class="text-primary">
                   - {{ notification.proposals.title }}
                 </span>
               </v-list-item-subtitle>
               
               <!-- Dodatni detalji za edit notifikacije -->
               <div v-if="notification.type === 'edit_proposed' && notification.proposal_contributions" class="mt-2">
                 <v-chip 
                   v-for="contribution in notification.proposal_contributions" 
                   :key="contribution.field_name"
                   size="small" 
                   color="warning" 
                   variant="outlined"
                   class="mr-1 mb-1"
                 >
                   {{ getFieldDisplayName(contribution.field_name) }}
                 </v-chip>
               </div>
               
               <div class="text-caption mt-1">
                 {{ formatDate(notification.created_at) }}
               </div>
               
               <template v-slot:append>
                 <v-btn
                   v-if="!notification.is_read"
                   icon
                   size="small"
                   @click.stop="markAsRead(notification.id)"
                 >
                   <v-icon>mdi-check</v-icon>
                 </v-btn>
               </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'Notifications',
  setup() {
    const authStore = useAuthStore();
    const notifications = ref([]);
    const loading = ref(false);
    
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.is_read).length;
    });
    
    const fetchNotifications = async () => {
      if (!authStore.currentUser?.id) return;
      
      loading.value = true;
      try {
        const response = await fetch(`${authStore.baseUrl}/api/notifications/${authStore.currentUser.id}`);
        if (response.ok) {
          notifications.value = await response.json();
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const markAsRead = async (notificationId) => {
      try {
        const response = await fetch(`${authStore.baseUrl}/api/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
        if (response.ok) {
          const notification = notifications.value.find(n => n.id === notificationId);
          if (notification) {
            notification.is_read = true;
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };
    
    const handleNotificationClick = (notification) => {
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
      
      // If it's an edit proposal notification, redirect to edit form
      if (notification.type === 'edit_proposed' && notification.contribution_id) {
        // Navigate to edit form with contribution ID
        window.location.href = `/proposal/${notification.proposal_id}/edit?contribution=${notification.contribution_id}`;
      }
    };
    
    const getNotificationIcon = (type) => {
      const icons = {
        'edit_proposed': 'mdi-pencil',
        'edit_approved': 'mdi-check-circle',
        'edit_rejected': 'mdi-close-circle',
        'new_contributor': 'mdi-account-plus'
      };
      return icons[type] || 'mdi-bell';
    };
    
    const getNotificationIconColor = (type) => {
      const colors = {
        'edit_proposed': 'warning',
        'edit_approved': 'success',
        'edit_rejected': 'error',
        'new_contributor': 'info'
      };
      return colors[type] || 'primary';
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
    
    onMounted(() => {
      fetchNotifications();
    });
    
          return {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        handleNotificationClick,
        getNotificationIcon,
        getNotificationIconColor,
        formatDate,
        getFieldDisplayName
      };
  }
};
</script>

<style scoped>
.notifications-container {
  max-width: 600px;
  margin: 0 auto;
}

.notifications-card {
  margin: 16px;
}

.unread {
  background-color: #f5f5f5;
  border-left: 4px solid #1976d2;
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: #f8f9fa;
}

.text-muted {
  color: #6c757d;
}
</style>
