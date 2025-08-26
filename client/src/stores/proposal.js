// stores/proposal.js
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const useProposalStore = defineStore('proposal', {
  state: () => ({
    proposals: [],
    users: [],
    municipalities: [],
    categories: [],
    baseUrl: 'http://localhost:3000',
  }),
  actions: {
    async fetchProposals() {
      try {
        const response = await fetch(`${this.baseUrl}/api/proposals`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        this.proposals = (data || []).map(p => ({
          proposalId: p.id,
          title: p.title,
          municipality_id: p.municipality_id,
          municipality: this.getMunicipalityName(p.municipality_id),
          category_id: p.category_id,
          category: this.getCategoryName(p.category_id),
          author_id: p.author_id,
          author: this.getUserName(p.author_id),
          summary: p.summary,
          details: {
            problem: p.problem_description,
            solution: p.proposed_solution,
            cost: p.estimated_cost,
            impact: p.expected_impact,
          },
          media: [],
          votes: p.votes || { for: 0, against: 0, abstain: 0 }, // Ažuriraj sa voteCounts
          voters: p.voters || { for: [], against: [], abstain: [] }, // Ovo može biti nepotrebno ako koristimo votes tabelu
          status: p.status,
          createdAt: p.created_at,
          contributors: [],
        }));
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    },
    async fetchUsers() {
      try {
        const res = await fetch(`${this.baseUrl}/api/users`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        this.users = await res.json();
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async fetchMunicipalities() {
      try {
        const res = await fetch(`${this.baseUrl}/api/municipalities`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        this.municipalities = await res.json();
      } catch (error) {
        console.error('Error fetching municipalities:', error);
      }
    },
    async fetchCategories() {
      try {
        const res = await fetch(`${this.baseUrl}/api/categories`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        this.categories = await res.json();
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    async voteProposal(proposalId, voteType) {
      const authStore = useAuthStore();
      if (!authStore.currentUser) throw new Error('User not logged in');
      const userId = authStore.currentUser.id;
      console.log(`Voting: proposalId=${proposalId}, userId=${userId}, voteType=${voteType}`); // Debug
      try {
        const response = await fetch(`${this.baseUrl}/api/proposals/${proposalId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, voteType }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        const data = await response.json();
        // Ažuriraj proposals sa novim voteCounts
        this.proposals = this.proposals.map(p =>
          p.proposalId === proposalId ? { ...p, votes: data.voteCounts } : p
        );
        return data;
      } catch (error) {
        console.error('Voting error:', error.message);
        throw error;
      }
    },
    getMunicipalityName(id) {
      return this.municipalities.find(m => m.id === id)?.name || 'Unknown';
    },
    getCategoryName(id) {
      return this.categories.find(c => c.id === id)?.name || 'General';
    },
    getUserName(id) {
      return this.users.find(u => u.id === id)?.name || `User ${id}`;
    },
  },
});