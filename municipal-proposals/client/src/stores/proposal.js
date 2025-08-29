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
    async createProposal(proposalData) {
      try {
        const response = await fetch(`${this.baseUrl}/api/proposals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposalData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        
        const newProposal = await response.json();
        
        // Add to local state
        this.proposals.push({
          proposalId: newProposal.id,
          title: newProposal.title,
          municipality_id: newProposal.municipality_id,
          municipality: newProposal.municipality,
          category_id: newProposal.category_id,
          category: newProposal.category,
          author_id: newProposal.author_id,
          author: this.getUserName(newProposal.author_id),
          summary: newProposal.summary,
          details: {
            problem: newProposal.problem_description,
            solution: newProposal.proposed_solution,
            cost: newProposal.estimated_cost,
            impact: newProposal.expected_impact,
          },
          media: newProposal.attachments || [],
          votes: { for: 0, against: 0, abstain: 0 },
          voters: { for: [], against: [], abstain: [] },
          status: newProposal.status,
          createdAt: newProposal.created_at,
          contributors: [],
        });
        
        return newProposal;
      } catch (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }
    },
    
    async fetchProposal(proposalId) {
      try {
        const response = await fetch(`${this.baseUrl}/api/proposals/${proposalId}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const proposal = await response.json();
        
        // Transform to match our format
        return {
          id: proposal.id,
          title: proposal.title,
          municipality_id: proposal.municipality_id,
          municipality: this.getMunicipalityName(proposal.municipality_id),
          category_id: proposal.category_id,
          category: this.getCategoryName(proposal.category_id),
          author_id: proposal.author_id,
          author: this.getUserName(proposal.author_id),
          summary: proposal.summary,
          details: {
            problem: proposal.problem_description,
            solution: proposal.proposed_solution,
            cost: proposal.estimated_cost,
            impact: proposal.expected_impact,
          },
          attachments: proposal.attachments || [],
          votes: proposal.votes || { for: 0, against: 0, abstain: 0 },
          voters: proposal.voters || { for: [], against: [], abstain: [] },
          status: proposal.status,
          created_at: proposal.created_at,
          contributors: proposal.contributors || [],
        };
      } catch (error) {
        console.error('Error fetching proposal:', error);
        throw error;
      }
    },
    
    async updateProposal(proposalData) {
      try {
        const response = await fetch(`${this.baseUrl}/api/proposals/${proposalData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proposalData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        
        const updatedProposal = await response.json();
        
        // Update local state
        const index = this.proposals.findIndex(p => p.proposalId === proposalData.id);
        if (index !== -1) {
          this.proposals[index] = {
            proposalId: updatedProposal.id,
            title: updatedProposal.title,
            municipality_id: updatedProposal.municipality_id,
            municipality: this.getMunicipalityName(updatedProposal.municipality_id),
            category_id: updatedProposal.category_id,
            category: this.getCategoryName(updatedProposal.category_id),
            author_id: updatedProposal.author_id,
            author: this.getUserName(updatedProposal.author_id),
            summary: updatedProposal.summary,
            details: {
              problem: updatedProposal.problem_description,
              solution: updatedProposal.proposed_solution,
              cost: updatedProposal.estimated_cost,
              impact: updatedProposal.expected_impact,
            },
            media: updatedProposal.attachments || [],
            votes: updatedProposal.votes || { for: 0, against: 0, abstain: 0 },
            voters: updatedProposal.voters || { for: [], against: [], abstain: [] },
            status: updatedProposal.status,
            createdAt: updatedProposal.created_at,
            contributors: updatedProposal.contributors || [],
          };
        }
        
        return updatedProposal;
      } catch (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }
    },
  },
});