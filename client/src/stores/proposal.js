import { defineStore } from 'pinia';

export const useProposalStore = defineStore('proposal', {
  state: () => ({
    proposals: [],
    users: [],
  }),
  actions: {
    async fetchProposals() {
      try {
        const response = await fetch('/api/proposals');
        const data = await response.json();
        // Normalize proposals: ensure votes reflect voters lengths when available
        this.proposals = (data || []).map(p => {
          const voters = p.voters || {};
          const normalizedVotes = p.votes || {
            for: (voters.for || []).length,
            against: (voters.against || []).length,
            abstain: (voters.abstain || []).length,
          };
          return { ...p, votes: normalizedVotes };
        });
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    },
    async fetchUsers() {
      try {
        const res = await fetch('/api/users');
        this.users = await res.json();
      } catch (error) {
        console.error('Error fetching users:', error);
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
    async updateProposal(id, proposal) {
      try {
        const response = await fetch(`/api/proposals/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposal),
        });
        const updated = await response.json();
        const idx = this.proposals.findIndex(p => p.proposalId === id);
        if (idx !== -1) this.proposals[idx] = updated;
        return updated;
      } catch (error) {
        console.error('Error updating proposal:', error);
      }
    },
    async createEditRequest(id, payload) {
      try {
        const response = await fetch(`/api/proposals/${id}/edits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return await response.json();
      } catch (error) {
        console.error('Error creating edit request:', error);
      }
    },
    async listEdits(id) {
      try {
        const response = await fetch(`/api/proposals/${id}/edits`);
        return await response.json();
      } catch (error) {
        console.error('Error listing edits:', error);
        return [];
      }
    },
    async mergeEdit(id, editId) {
      try {
        const response = await fetch(`/api/proposals/${id}/edits/${editId}/merge`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data?.proposal) {
          const idx = this.proposals.findIndex(p => p.proposalId === id);
          if (idx !== -1) this.proposals[idx] = data.proposal;
        }
        return data;
      } catch (error) {
        console.error('Error merging edit:', error);
      }
    },
    async voteProposal(id, type) {
      try {
        const response = await fetch(`/api/proposals/${id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        });
        const data = await response.json();
        const idx = this.proposals.findIndex(p => p.proposalId === id);
        if (idx !== -1) {
          this.proposals[idx].votes = data.votes;
          this.proposals[idx].voteHistory = data.voteHistory;
        }
        return data;
      } catch (error) {
        console.error('Error voting:', error);
      }
    },
  },
});