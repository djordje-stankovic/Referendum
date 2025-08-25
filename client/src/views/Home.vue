<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="8">
        <v-card
          v-for="proposal in proposals"
          :key="proposal.proposalId"
          class="mb-4"
          variant="elevated"
          @click="$router.push(`/proposal/${proposal.proposalId}`)"
          style="cursor: pointer;"
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

<script>
import { useProposalStore } from '@/stores/proposal';
export default {
  setup() {
    const store = useProposalStore();
    store.fetchProposals();
    return { store };
  },
  computed: {
    proposals() {
      if (!this.activeCategory) return this.store.proposals;
      return this.store.proposals.filter(p => (p.category || 'General') === this.activeCategory);
    },
    topProposals() {
      return [...this.store.proposals]
        .sort((a, b) => (b.votes?.for ?? 0) - (a.votes?.for ?? 0))
        .slice(0, 5);
    },
  },
  data() {
    return {
      activeCategory: '',
      categories: [
        'Transportation',
        'Infrastructure',
        'Urban Planning',
        'Environment',
        'Public Safety',
        'Education',
        'Healthcare',
        'Social Services',
        'Culture & Arts',
        'Sports & Recreation',
        'Tourism',
        'Digital Government',
        'Economy & Business',
        'Utilities & Energy',
        'Parks & Greenery',
      ],
    };
  },
  methods: {
    filterBy(cat) {
      this.activeCategory = cat;
    },
  },
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