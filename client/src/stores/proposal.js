import { defineStore } from 'pinia';

export const useProposalStore = defineStore('proposal', {
  state: () => ({
    proposals: [],
  }),
  actions: {
    async fetchProposals() {
      try {
        const response = await fetch('/api/proposals');
        this.proposals = await response.json();
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    },
    async addProposal(proposal) {
      try {
        const response = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposal),
        });
        const newProposal = await response.json();
        this.proposals.push(newProposal);
      } catch (error) {
        console.error('Error adding proposal:', error);
      }
    },
  },
});