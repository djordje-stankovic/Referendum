<template>
  <v-container>
    <v-card>
      <v-card-title>{{ proposal.title }}</v-card-title>
      <v-card-subtitle>{{ proposal.municipality }} | {{ proposal.author }} | {{ proposal.createdAt }}</v-card-subtitle>
      <v-chip :color="statusColor">{{ proposal.status }}</v-chip>
      <v-expansion-panels>
        <v-expansion-panel title="Summary">
          <v-expansion-panel-text>{{ proposal.summary }}</v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Details">
          <v-expansion-panel-text>
            <strong>Problem:</strong> {{ proposal.details.problem }}<br>
            <strong>Solution:</strong> {{ proposal.details.solution }}<br>
            <strong>Cost:</strong> {{ proposal.details.cost }}<br>
            <strong>Impact:</strong> {{ proposal.details.impact }}
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Media">
          <v-expansion-panel-text>
            <v-img v-for="media in proposal.media" :key="media" :src="media" max-height="200"></v-img>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Votes">
          <v-expansion-panel-text>
            <v-btn color="secondary" class="mr-2">For ({{ proposal.votes.for }})</v-btn>
            <v-btn color="error" class="mr-2">Against ({{ proposal.votes.against }})</v-btn>
            <v-btn color="grey">Abstain ({{ proposal.votes.abstain }})</v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-card-actions>
        <v-btn color="primary" @click="openEditModal">Suggest Edit</v-btn>
      </v-card-actions>
    </v-card>
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
    proposal() {
      return this.store.proposals.find(p => p.proposalId === parseInt(this.$route.params.id)) || {};
    },
    statusColor() {
      return this.proposal.status === 'Approved' ? 'success' : 'warning';
    },
  },
  methods: {
    openEditModal() {
      // Implement edit modal logic
    },
  },
};
</script>