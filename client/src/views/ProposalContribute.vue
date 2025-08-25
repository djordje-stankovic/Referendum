<template>
  <v-container>
    <v-card>
      <v-card-title>Contribute to Proposal</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-text-field v-model="editSummary" label="Edit Summary" required />
          <v-textarea v-model="changes.summary" label="New Summary" />
          <v-textarea v-model="changes.details.problem" label="New Problem" />
          <v-textarea v-model="changes.details.solution" label="New Solution" />
          <v-text-field v-model="changes.details.cost" label="New Estimated Cost" />
          <v-textarea v-model="changes.details.impact" label="New Impact" />

          <v-file-input
            v-model="files"
            label="Attach files"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xlsx,.csv"
            prepend-icon="mdi-paperclip"
          />

          <v-card-actions>
            <v-btn type="submit" color="primary">Submit Contribution</v-btn>
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
  created() {
    if (!this.store.proposals.length) {
      this.store.fetchProposals().then(() => this.prefill());
    } else {
      this.prefill();
    }
  },
  data() {
    return {
      editSummary: '',
      changes: {
        summary: '',
        details: { problem: '', solution: '', cost: '', impact: '' },
        media: [],
      },
      files: [],
    };
  },
  computed: {
    proposalId() {
      return parseInt(this.$route.params.id);
    },
  },
  methods: {
    prefill() {
      const p = this.store.proposals.find(x => x.proposalId === this.proposalId);
      if (!p) return;
      this.changes = JSON.parse(JSON.stringify({
        summary: p.summary,
        details: { ...p.details },
        media: [...(p.media || [])],
      }));
    },
    async submit() {
      const filePayloads = await Promise.all((this.files || []).map(f => this.fileToPayload(f)));
      const payload = {
        authorId: 5,
        summary: this.editSummary,
        changes: { ...this.changes, media: filePayloads.map(f => f.name) },
        attachments: filePayloads,
      };
      await this.store.createEditRequest(this.proposalId, payload);
      this.$router.push(`/proposal/${this.proposalId}`);
    },
    fileToPayload(file) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      });
    },
  },
};
</script>


