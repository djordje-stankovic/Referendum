<template>
  <v-container>
    <v-card>
      <v-card-title>Create Proposal</v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-3">
          Unesite osnovne podatke, a možete koristiti i AI asistenta da predloži ciljeve, korake i KPI-jeve.
        </v-alert>
        <v-form @submit.prevent="submitProposal">
          <v-text-field v-model="proposal.title" label="Title" required></v-text-field>
          <v-textarea v-model="proposal.summary" label="Summary" required></v-textarea>
          <v-select :items="categories" v-model="proposal.category" label="Category" required></v-select>
          <v-textarea v-model="proposal.details.problem" label="Problem" required></v-textarea>
          <v-textarea v-model="proposal.details.solution" label="Solution" required></v-textarea>
          <v-text-field v-model="proposal.details.cost" label="Estimated Cost" required></v-text-field>
          <v-textarea v-model="proposal.details.impact" label="Expected Impact" required></v-textarea>
          <tiptap v-model="proposal.details.solution" :extensions="extensions" />

          <v-divider class="my-4" />
          <div class="d-flex gap-2 mb-2">
            <v-btn color="primary" @click="openAiAssist">AI Assist</v-btn>
            <v-btn variant="tonal" @click="aiValidate">AI Validate</v-btn>
            <v-spacer />
            <v-btn type="submit" color="primary">Submit</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="aiDialog" max-width="640">
      <v-card>
        <v-card-title>AI Assist</v-card-title>
        <v-card-text>
          <v-textarea v-model="aiProblem" label="Briefly describe the problem" rows="3" />
          <v-btn color="primary" class="mt-2" @click="runAiSuggest" :loading="aiLoading">Generate suggestions</v-btn>
          <div v-if="aiResult" class="mt-4">
            <div class="text-subtitle-2 mb-1">Suggested Summary</div>
            <v-textarea v-model="aiResult.summary" rows="2" />
            <div class="text-subtitle-2 mt-3 mb-1">Goals</div>
            <v-list density="compact">
              <v-list-item v-for="(g, i) in aiResult.goals" :key="'g'+i">
                <v-text-field v-model="aiResult.goals[i]" />
              </v-list-item>
            </v-list>
            <div class="text-subtitle-2 mt-3 mb-1">Steps</div>
            <v-list density="compact">
              <v-list-item v-for="(s, i) in aiResult.steps" :key="'s'+i">
                <v-text-field v-model="aiResult.steps[i]" />
              </v-list-item>
            </v-list>
            <div class="text-subtitle-2 mt-3 mb-1">KPIs</div>
            <v-list density="compact">
              <v-list-item v-for="(k, i) in aiResult.kpis" :key="'k'+i">
                <v-text-field v-model="aiResult.kpis[i]" />
              </v-list-item>
            </v-list>
            <div class="text-subtitle-2 mt-3 mb-1">Risks</div>
            <v-list density="compact">
              <v-list-item v-for="(r, i) in aiResult.risks" :key="'r'+i">
                <v-text-field v-model="aiResult.risks[i]" />
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="aiDialog=false">Close</v-btn>
          <v-btn color="primary" :disabled="!aiResult" @click="applyAi">Apply to form</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        category: '',
        details: { problem: '', solution: '', cost: '', impact: '' },
        media: [],
      },
      extensions: [StarterKit],
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
      aiDialog: false,
      aiProblem: '',
      aiLoading: false,
      aiResult: null,
    };
  },
  methods: {
    async submitProposal() {
      await this.store.addProposal(this.proposal);
      this.$router.push('/');
    },
    openAiAssist() {
      this.aiDialog = true;
    },
    async runAiSuggest() {
      this.aiLoading = true;
      try {
        const res = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem: this.aiProblem }),
        });
        this.aiResult = await res.json();
      } finally {
        this.aiLoading = false;
      }
    },
    async aiValidate() {
      const res = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: this.proposal }),
      });
      const data = await res.json();
      const msg = data.ok ? 'Looks good!' : `Missing: ${data.missing.join(', ')}`;
      alert(`${msg}\nTips: ${data.tips.join('; ')}`);
    },
    applyAi() {
      if (!this.aiResult) return;
      if (!this.proposal.summary) this.proposal.summary = this.aiResult.summary;
      // Append steps/goals/kpis/risks into impact field for now (demo)
      const parts = [];
      if (this.aiResult.goals?.length) parts.push(`Goals: ${this.aiResult.goals.join(' | ')}`);
      if (this.aiResult.steps?.length) parts.push(`Steps: ${this.aiResult.steps.join(' | ')}`);
      if (this.aiResult.kpis?.length) parts.push(`KPIs: ${this.aiResult.kpis.join(' | ')}`);
      if (this.aiResult.risks?.length) parts.push(`Risks: ${this.aiResult.risks.join(' | ')}`);
      this.proposal.details.impact = [this.proposal.details.impact, parts.join(' \n ')].filter(Boolean).join(' \n ');
      this.aiDialog = false;
    },
  },
};
</script>