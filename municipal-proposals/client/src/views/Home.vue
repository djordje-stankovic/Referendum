<template>
  <div>




         <!-- Sticky Search Section -->
     <div class="sticky-search-container">
       <v-card class="search-card" elevation="2" rounded="lg">
         <v-card-text class="pa-4">
                       <div class="d-flex align-center gap-3">
              <v-text-field
                v-model="searchQuery"
                placeholder="Search proposals..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                class="search-input"
                style="flex: 1;"
              />
              <v-btn
                color="primary"
                variant="outlined"
                @click="showCategorySelector = true"
                prepend-icon="mdi-tag-multiple"
                class="category-selector-btn"
                size="small"
              >
                Categories
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                :to="'/drafts'"
                prepend-icon="mdi-file-document-outline"
                size="small"
                elevation="1"
              >
                My Drafts
              </v-btn>
              <v-btn
                color="accent"
                variant="flat"
                :to="'/create'"
                prepend-icon="mdi-plus"
                class="create-proposal-btn"
                size="small"
                elevation="2"
              >
                Create Proposal
              </v-btn>
            </div>
           
           <!-- Selected Categories Chips -->
           <div v-if="selectedCategories.length > 0" class="selected-categories">
             <div class="d-flex align-center gap-2 flex-wrap">
               <v-chip
                 v-for="cat in selectedCategories"
                 :key="cat"
                 color="primary"
                 variant="flat"
                 size="x-small"
                 closable
                 @click:close="removeCategory(cat)"
                 class="category-chip"
               >
                 {{ cat }}
               </v-chip>
             </div>
           </div>
         </v-card-text>
       </v-card>
     </div>

    <v-row>
      <v-col cols="12" md="8" lg="8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
          <p class="text-h6 text-medium-emphasis mt-4">Loading proposals...</p>
        </div>

        <!-- Proposals Grid -->
        <div v-else>
          <v-card
            v-for="proposal in filteredProposals"
            :key="proposal.proposalId"
            class="proposal-card mb-4"
            variant="elevated"
            elevation="2"
            rounded="lg"
            @click="$router.push(`/proposal/${proposal.proposalId}`)"
            style="cursor: pointer;"
          >
            <v-card-item class="pa-4">
              <div class="d-flex align-start gap-4">
                <!-- Author Avatar -->
                <v-avatar size="40" class="flex-shrink-0">
                  <v-img :src="getUserAvatar(proposal.author_id || 1)" cover />
                </v-avatar>
                
                <!-- Content -->
                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <h3 class="text-h6 font-weight-bold text-primary mb-1">
                      {{ proposal.title }}
                    </h3>
                    <v-chip 
                      color="success" 
                      variant="flat" 
                      size="small"
                      prepend-icon="mdi-thumb-up"
                      class="vote-chip"
                    >
                      {{ proposal.votes?.for ?? 0 }}
                    </v-chip>
                  </div>
                  
                  <!-- Author and Date -->
                  <div class="d-flex align-center gap-3 mb-3">
                    <span class="text-caption text-medium-emphasis">
                      by {{ getUserName(proposal.author_id || 1) }}
                    </span>
                    <span class="text-caption text-medium-emphasis">
                      {{ proposal.createdAt?.slice(0,10) }}
                    </span>
                  </div>
                  
                  <!-- Tags -->
                  <div class="d-flex align-center gap-2 mb-3">
                    <v-chip 
                      color="secondary" 
                      variant="flat" 
                      size="x-small"
                      prepend-icon="mdi-map-marker"
                    >
                      {{ proposal.municipality }}
                    </v-chip>
                    <v-chip 
                      color="accent" 
                      variant="flat" 
                      size="x-small"
                      prepend-icon="mdi-tag"
                    >
                      {{ proposal.category || 'General' }}
                    </v-chip>
                  </div>
                  
                  <!-- Summary -->
                  <p class="text-body-2 text-medium-emphasis line-clamp-2 mb-0">
                    {{ proposal.summary }}
                  </p>
                </div>
              </div>
            </v-card-item>

            <!-- Media Section (smaller) -->
            <v-img
              v-if="proposal.media && proposal.media.length"
              :src="proposal.media[0]"
              height="160"
              cover
              class="mx-4 mb-3"
              rounded="md"
            />
          </v-card>

          <!-- Empty State -->
          <v-card v-if="proposals.length === 0" class="empty-state" elevation="2" rounded="xl">
            <v-card-text class="text-center py-12">
              <v-icon icon="mdi-file-document-outline" size="64" color="grey" class="mb-4" />
              <h3 class="text-h5 text-medium-emphasis mb-2">No proposals yet</h3>
              <p class="text-body-1 text-medium-emphasis mb-6">
                Be the first to create a proposal for your municipality!
              </p>
              <div class="d-flex gap-3 justify-center">
                <v-btn 
                  color="primary" 
                  :to="'/create'"
                  prepend-icon="mdi-plus"
                  size="large"
                >
                  Create First Proposal
                </v-btn>
                <v-btn 
                  color="secondary" 
                  :to="'/drafts'"
                  prepend-icon="mdi-file-document-outline"
                  variant="outlined"
                  size="large"
                >
                  View Drafts
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

                   <!-- Sidebar -->
             <v-col cols="12" md="4" lg="4">
               <!-- Categories Card -->
               <v-card class="sidebar-card mb-4" elevation="2" rounded="lg">
                 <v-card-title class="d-flex align-center pa-4 pb-3">
                   <v-icon icon="mdi-tag-multiple" color="primary" class="mr-2" size="20" />
                   <span class="text-subtitle-1 font-weight-bold">Categories</span>
                 </v-card-title>
                 <v-divider />
                 <div class="pa-3">
                                       <v-chip
                      v-for="cat in categories"
                      :key="cat"
                      :color="selectedCategories.includes(cat) ? 'primary' : undefined"
                      variant="outlined"
                      size="small"
                      class="ma-1"
                      @click="filterBy(cat)"
                      style="cursor: pointer;"
                    >
                      {{ cat }}
                    </v-chip>
                 </div>
               </v-card>

               <!-- Trending Card -->
               <v-card class="sidebar-card" elevation="2" rounded="lg">
                 <v-card-title class="d-flex align-center pa-4 pb-3">
                   <v-icon icon="mdi-trending-up" color="accent" class="mr-2" size="20" />
                   <span class="text-subtitle-1 font-weight-bold">Trending</span>
                 </v-card-title>
                 <v-divider />
                 <div class="pa-3">
                   <div
                     v-for="proposal in topProposals"
                     :key="proposal.proposalId"
                     class="trending-item pa-2 mb-2 rounded-lg"
                     style="cursor: pointer;"
                     @click="$router.push(`/proposal/${proposal.proposalId}`)"
                   >
                     <div class="d-flex align-center gap-2">
                       <v-icon icon="mdi-fire" color="accent" size="16" />
                       <span class="text-body-2 font-weight-medium line-clamp-1">
                         {{ proposal.title }}
                       </span>
                     </div>
                     <div class="d-flex align-center gap-2 mt-1">
                       <v-chip color="success" variant="flat" size="x-small">
                         {{ proposal.votes?.for ?? 0 }} votes
                       </v-chip>
                       <span class="text-caption text-medium-emphasis">
                         {{ proposal.municipality }}
                       </span>
                     </div>
                   </div>
                 </div>
               </v-card>
             </v-col>
    </v-row>

    <!-- Category Selector Dialog -->
    <v-dialog v-model="showCategorySelector" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
          <span class="text-h6">Select Categories</span>
          <v-btn icon="mdi-close" variant="text" @click="showCategorySelector = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="cat in availableCategories"
              :key="cat"
              :color="selectedCategories.includes(cat) ? 'primary' : undefined"
              variant="outlined"
              size="large"
              @click="toggleCategory(cat)"
              style="cursor: pointer;"
              class="selectable-category"
            >
              {{ cat }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            color="primary"
            @click="showCategorySelector = false"
            variant="flat"
          >
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
         </v-dialog>

     <!-- Floating Action Button for Create Proposal -->
     <v-btn
       color="accent"
       icon="mdi-plus"
       class="fab-create-proposal"
       size="large"
       :to="'/create'"
       elevation="8"
       title="Create New Proposal"
     />

   </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';

const store = useProposalStore();
const authStore = useAuthStore();
const loading = ref(true);
const searchQuery = ref('');
const selectedCategories = ref([]);
const showCategorySelector = ref(false);
const viewMode = ref('grid');

onMounted(async () => {
  await Promise.all([
    store.fetchProposals(),
    store.fetchUsers(),
    store.fetchMunicipalities(),
    store.fetchCategories(),
  ]);
  loading.value = false;
  console.log('Fetched Proposals:', store.proposals);
  console.log('Current User on Mount:', authStore.currentUser);
});

// Filtriraj predloge prema opštini ulogovanog korisnika
const proposals = computed(() => {
  if (!authStore.currentUser) return store.proposals;
  const userMunicipalityId = authStore.currentUser.municipality_id;
  console.log('User Municipality ID:', userMunicipalityId);
  console.log('Filtered Proposals:', store.proposals.filter(p => p.municipality_id === userMunicipalityId));
  return store.proposals.filter(p => p.municipality_id === userMunicipalityId);
});

// Trending sekcija koristi sve predloge, ne filtrira po opštini
const topProposals = computed(() => {
  return [...store.proposals]
    .sort((a, b) => (b.votes?.for ?? 0) - (a.votes?.for ?? 0))
    .slice(0, 5);
});

const categories = computed(() => store.categories.map(c => c.name));

// Available categories (excluding already selected ones)
const availableCategories = computed(() => {
  return categories.value.filter(cat => !selectedCategories.value.includes(cat));
});

const activeCategory = ref('');
const filterBy = (cat) => {
  activeCategory.value = cat;
  if (!selectedCategories.value.includes(cat)) {
    selectedCategories.value.push(cat);
  }
};

// Search and filter proposals
const filteredProposals = computed(() => {
  let filtered = proposals.value;
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.summary.toLowerCase().includes(query) ||
      p.municipality.toLowerCase().includes(query)
    );
  }
  
  // Filter by selected categories
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(p => 
      selectedCategories.value.includes(p.category || 'General')
    );
  }
  
  return filtered;
});

// Category management functions
const toggleCategory = (category) => {
  if (selectedCategories.value.includes(category)) {
    removeCategory(category);
  } else {
    selectedCategories.value.push(category);
  }
};

const removeCategory = (category) => {
  const index = selectedCategories.value.indexOf(category);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  }
};

// Helper functions
const getUserAvatar = (id) => `https://i.pravatar.cc/40?img=${(id % 70) + 1}`;
const getUserName = (id) => {
  const user = store.users.find(u => u.id === id);
  return user ? `${user.first_name} ${user.last_name}` : `User ${id}`;
};
</script>

<style scoped>
/* Sticky Search Section */
.sticky-search-container {
  position: sticky;
  top: 130px;
  z-index: 90;
  margin-bottom: 24px;
}

.search-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
}

.category-selector-btn {
  border-color: rgba(139, 92, 246, 0.3);
  color: #374151;
  font-weight: 500;
  transition: all 0.3s ease;
}

.category-selector-btn:hover {
  border-color: #8B5CF6;
  background-color: rgba(139, 92, 246, 0.05);
  transform: translateY(-1px);
}

.create-proposal-btn {
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%) !important;
  color: white !important;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none !important;
}

.create-proposal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3) !important;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) !important;
}

.selected-categories {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 16px;
}

.category-chip {
  transition: all 0.2s ease;
}

.category-chip:hover {
  transform: scale(1.05);
}

.selectable-category {
  transition: all 0.2s ease;
  cursor: pointer;
}

.selectable-category:hover {
  transform: scale(1.05);
  background-color: rgba(139, 92, 246, 0.1) !important;
}



/* Proposal Cards */
.proposal-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.proposal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  border-color: rgba(139, 92, 246, 0.2);
}

.proposal-card .v-card-item {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Vote Chip */
.vote-chip {
  font-weight: 600;
  transition: all 0.3s ease;
}

.vote-chip:hover {
  transform: scale(1.05);
}

/* Sidebar Cards */
.sidebar-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Category and Trending Items */
.category-item,
.trending-item {
  transition: all 0.2s ease;
  border-radius: 8px;
}

.category-item:hover,
.trending-item:hover {
  background-color: rgba(139, 92, 246, 0.1) !important;
  transform: translateX(4px);
}

/* Empty State */
.empty-state {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  border: 2px dashed rgba(139, 92, 246, 0.3);
}



/* Line Clamp Utility */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}



/* Responsive Design */
@media (max-width: 768px) {
  .sticky-search-container {
    top: 110px;
  }
  
  .search-card .v-card-text {
    padding: 16px 12px !important;
  }
  
  .proposal-card {
    margin-bottom: 16px !important;
  }
  
  .category-selector-btn {
    min-width: 100px;
  }
  
  .create-proposal-btn {
    min-width: 120px;
    font-size: 0.75rem;
  }
  
  .fab-create-proposal {
    right: 16px;
    bottom: 16px;
  }
}

/* Smooth animations */
* {
  transition: all 0.2s ease;
}

/* Floating Action Button */
.fab-create-proposal {
  position: fixed !important;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%) !important;
  transition: all 0.3s ease;
}

.fab-create-proposal:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>