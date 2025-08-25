<template>
  <v-container>
    <v-row>
      <v-col v-for="proposal in proposals" :key="proposal.proposalId" cols="12" md="4">
        <v-card class="ma-2" elevation="2">
          <v-img :src="proposal.media[0] || 'https://via.placeholder.com/200'" height="200"></v-img>
          <v-card-title>{{ proposal.title }}</v-card-title>
          <v-card-subtitle>{{ proposal.municipality }}</v-card-subtitle>
          <v-card-text>{{ proposal.summary }}</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="`/proposal/${proposal.proposalId}`">View</v-btn>
            <v-btn color="secondary">For ({{ proposal.votes.for }})</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-btn fab color="primary" fixed bottom right :to="'/create'">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
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
      return this.store.proposals;
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