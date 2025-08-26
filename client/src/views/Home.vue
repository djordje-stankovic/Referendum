<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="8">
        <div v-if="loading">Loading proposals...</div>
        <v-card
          v-for="proposal in proposals"
          :key="proposal.proposalId"
          class="mb-4"
          variant="elevated"
          @click="$router.push(`/proposal/${proposal.proposalId}`)"
          style="cursor: pointer;"
          v-else
        >
          <v-card-item>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h6">{{ proposal.title }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ proposal.municipality }} • {{ proposal.category || 'General' }} • {{ proposal.createdAt?.slice(0,10) }}
                </div>
              </div>
            </div>
          </v-card-item>
          <v-img
            v-if="proposal.media && proposal.media.length"
            :src="proposal.media[0]"
            height="220"
            cover
          />
          <v-card-text class="pt-3">
            {{ proposal.summary }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-chip color="secondary" variant="flat">For {{ proposal.votes?.for ?? 0 }}</v-chip>
          </v-card-actions>
        </v-card>

        <v-btn
          color="primary"
          icon="mdi-plus"
          class="position-fixed"
          style="right: 24px; bottom: 24px;"
          size="large"
          :to="'/create'"
        />
      </v-col>
      <v-col cols="12" md="4" lg="4">
        <v-card class="mb-4">
          <v-card-title>Explore categories</v-card-title>
          <v-divider></v-divider>
          <v-list density="compact">
            <v-list-item v-for="cat in categories" :key="cat" :title="cat" @click="filterBy(cat)" />
          </v-list>
        </v-card>
        <v-card>
          <v-card-title>Trending</v-card-title>
          <v-divider></v-divider>
          <v-list density="compact">
            <v-list-item v-for="proposal in topProposals" :key="proposal.proposalId" :title="proposal.title" :to="`/proposal/${proposal.proposalId}`" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';

const store = useProposalStore();
const authStore = useAuthStore();
const loading = ref(true);

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

const activeCategory = ref('');
const filterBy = (cat) => {
  activeCategory.value = cat;
};
</script>

<style>
.v-card {
  transition: transform 0.3s;
}
.v-card:hover {
  transform: scale(1.05);
}
</style>