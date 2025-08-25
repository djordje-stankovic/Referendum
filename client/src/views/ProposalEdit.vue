<template>
  <v-container>
    <v-card>
      <v-card-title>Edit Proposal</v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          Your edits will be submitted as a request for review by the author.
        </v-alert>
        <v-form @submit.prevent="submit">
          <v-text-field v-model="form.title" label="Title" required></v-text-field>
          <v-textarea v-model="form.summary" label="Summary" required></v-textarea>
          <v-textarea v-model="form.details.problem" label="Problem" required></v-textarea>
          <v-textarea v-model="form.details.solution" label="Solution" required></v-textarea>
          <v-text-field v-model="form.details.cost" label="Estimated Cost" required></v-text-field>
          <v-textarea v-model="form.details.impact" label="Expected Impact" required></v-textarea>

          <v-divider class="my-4" />
          <v-text-field v-model="editSummary" label="Edit Summary (commit message)" required></v-text-field>
          <v-card-actions>
            <v-btn type="submit" color="primary">Submit Edit Request</v-btn>
            <v-btn variant="text" @click="$router.back()">Cancel</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useProposalStore } from '@/stores/proposal';
export default {
  setup() {
    const store = useProposalStore();
    return { store };
  },
  data() {
    return {
      form: {
        title: '',
        municipality: '',
        summary: '',
        details: { problem: '', solution: '', cost: '', impact: '' },
        media: [],
      },
      editSummary: '',
    };
  },
  computed: {
    proposalId() {
      return parseInt(this.$route.params.id);
    },
  },
  created() {
    if (!this.store.proposals.length) {
      this.store.fetchProposals().then(() => this.hydrate());
    } else {
      this.hydrate();
    }
  },
  methods: {
    hydrate() {
      const found = this.store.proposals.find(p => p.proposalId === this.proposalId);
      if (found) {
        this.form = JSON.parse(JSON.stringify(found));
      }
    },
    async submit() {
      const changes = this.form;
      await this.store.createEditRequest(this.proposalId, {
        authorId: 5,
        summary: this.editSummary,
        changes,
      });
      this.$router.push(`/proposal/${this.proposalId}`);
    },
  },
};
</script>


