<template>
  <v-container>
    <v-card>
      <v-card-title>Create Proposal</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitProposal">
          <v-text-field v-model="proposal.title" label="Title" required></v-text-field>
          <v-textarea v-model="proposal.summary" label="Summary" required></v-textarea>
          <v-textarea v-model="proposal.details.problem" label="Problem" required></v-textarea>
          <v-textarea v-model="proposal.details.solution" label="Solution" required></v-textarea>
          <v-text-field v-model="proposal.details.cost" label="Estimated Cost" required></v-text-field>
          <v-textarea v-model="proposal.details.impact" label="Expected Impact" required></v-textarea>
          <tiptap v-model="proposal.details.solution" :extensions="extensions" />
          <v-btn type="submit" color="primary">Submit</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useProposalStore } from '@/stores/proposal';
export default {
  setup() {
    const store = useProposalStore();
    return { store };
  },
  data() {
    return {
      proposal: {
        title: '',
        municipality: 'Novi Sad', // Hardcoded for testing
        summary: '',
        details: { problem: '', solution: '', cost: '', impact: '' },
        media: [],
      },
      extensions: [StarterKit],
    };
  },
  methods: {
    async submitProposal() {
      await this.store.addProposal(this.proposal);
      this.$router.push('/');
    },
  },
};
</script>