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

          <v-divider class="my-4" />
          <div class="text-subtitle-1 mb-2">Problem</div>
          <v-textarea v-model="proposal.details.problem" label="Describe the problem" required></v-textarea>

          <div class="text-subtitle-1 mt-4 mb-2">Proposed Solution</div>
          <v-textarea v-model="proposal.details.solution" label="High-level solution" required></v-textarea>

          <v-row class="mt-2">
            <v-col cols="12" md="6">
              <v-text-field v-model="proposal.details.cost" label="Estimated Cost" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="proposal.details.impact" label="Expected Impact" required></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4" />
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 mb-2">Goals</div>
              <div v-for="(g, i) in goals" :key="'goal-'+i" class="d-flex align-center mb-2">
                <v-text-field v-model="goals[i]" placeholder="Goal" density="comfortable" hide-details></v-text-field>
                <v-btn icon variant="text" color="error" @click="removeItem(goals, i)"><v-icon>mdi-close</v-icon></v-btn>
              </div>
              <v-btn size="small" variant="tonal" @click="addItem(goals)">Add goal</v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 mb-2">Steps</div>
              <div v-for="(s, i) in steps" :key="'step-'+i" class="d-flex align-center mb-2">
                <v-text-field v-model="steps[i]" placeholder="Step" density="comfortable" hide-details></v-text-field>
                <v-btn icon variant="text" color="error" @click="removeItem(steps, i)"><v-icon>mdi-close</v-icon></v-btn>
              </div>
              <v-btn size="small" variant="tonal" @click="addItem(steps)">Add step</v-btn>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 mb-2">KPIs</div>
              <div v-for="(k, i) in kpis" :key="'kpi-'+i" class="d-flex align-center mb-2">
                <v-text-field v-model="kpis[i]" placeholder="KPI" density="comfortable" hide-details></v-text-field>
                <v-btn icon variant="text" color="error" @click="removeItem(kpis, i)"><v-icon>mdi-close</v-icon></v-btn>
              </div>
              <v-btn size="small" variant="tonal" @click="addItem(kpis)">Add KPI</v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 mb-2">Risks</div>
              <div v-for="(r, i) in risks" :key="'risk-'+i" class="d-flex align-center mb-2">
                <v-text-field v-model="risks[i]" placeholder="Risk" density="comfortable" hide-details></v-text-field>
                <v-btn icon variant="text" color="error" @click="removeItem(risks, i)"><v-icon>mdi-close</v-icon></v-btn>
              </div>
              <v-btn size="small" variant="tonal" @click="addItem(risks)">Add risk</v-btn>
            </v-col>
          </v-row>

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
<script setup>
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';


Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const store = useProposalStore();
const authStore = useAuthStore();
const route = useRoute();
const chartCanvas = ref(null);
const activeTab = ref('for');
const voteDialog = ref(false);
const votePending = ref('for');
const newComment = ref('');
const comments = ref([]);
const loading = ref(false);
const userVote = ref(null); // Promeni u ref umesto computed
let _chart = null;

onMounted(async () => {
  await Promise.all([
    store.fetchProposals(),
    store.fetchUsers(),
    store.fetchMunicipalities(),
    store.fetchCategories(),
  ]);
  // Dohvati userVote asinhrono
  if (authStore.currentUser) {
    const userId = authStore.currentUser.id;
    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('proposal_id', route.params.id)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') console.error('Error fetching user vote:', error);
    else userVote.value = data?.vote_type ? (data.vote_type === 'for' ? 'FOR' : data.vote_type === 'against' ? 'AGAINST' : 'ABSTAIN') : null;
  }
  renderChart();
});

const proposal = computed(() => store.proposals.find(p => p.proposalId === parseInt(route.params.id)) || {});
const statusColor = computed(() => proposal.value.status === 'Approved' ? 'success' : 'warning');
const voteCounts = computed(() => proposal.value.votes || { for: 0, against: 0, abstain: 0 });
const contributors = [
  { id: 1, name: 'Ana Petrović', role: 'Author', share: 60, avatar: 'https://i.pravatar.cc/40?img=11' },
  { id: 2, name: 'Marko Marković', role: 'Reviewer', share: 25, avatar: 'https://i.pravatar.cc/40?img=22' },
  { id: 3, name: 'Ivana Jovanović', role: 'Contributor', share: 15, avatar: 'https://i.pravatar.cc/40?img=33' },
];

const renderChart = async () => {
  await nextTick();
  const canvas = chartCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (_chart) {
    try { _chart.destroy(); } catch {}
    _chart = null;
  }
  const data = [voteCounts.value.for, voteCounts.value.against, voteCounts.value.abstain];
  _chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['For', 'Against', 'Abstain'],
      datasets: [{
        data,
        backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
        borderWidth: 2,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  });
};

watch(proposal, () => renderChart(), { deep: true });

const userName = (id) => {
  const u = store.users.find(u => u.id === id);
  return u ? `${u.first_name} ${u.last_name}` : `User ${id}`;
};
const getUserAvatar = (id) => `https://i.pravatar.cc/32?img=${(id % 70) + 1}`;
const getContributionColor = (share) => (share >= 50 ? 'success' : share >= 25 ? 'primary' : 'warning');
const extractFileName = (path) => (path ? path.split('/').pop() : '');
const openVote = (type) => {
  if (userVote.value) return; // Onemogući otvaranje dijaloga ako je već glasano
  votePending.value = type;
  voteDialog.value = true;
};
const voteLabel = (type) => (type === 'for' ? 'Za' : type === 'against' ? 'Protiv' : 'Uzdržan');
const confirmVote = async () => {
  if (userVote.value || !authStore.currentUser) return; // Provera userVote
  loading.value = true;
  try {
    await store.voteProposal(parseInt(route.params.id), votePending.value);
    voteDialog.value = false;
    await store.fetchProposals();
    renderChart();
    // Ažuriraj userVote nakon glasanja
    const userId = authStore.currentUser.id;
    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('proposal_id', route.params.id)
      .eq('user_id', userId)
      .single();
    userVote.value = data?.vote_type ? (data.vote_type === 'for' ? 'FOR' : data.vote_type === 'against' ? 'AGAINST' : 'ABSTAIN') : null;
  } catch (error) {
    console.error('Voting error:', error.message);
  } finally {
    loading.value = false;
  }
};
const postComment = () => {
  const text = newComment.value.trim();
  if (!text) return;
  comments.value.unshift({ id: Date.now(), userId: authStore.currentUser?.id || 1, text });
  newComment.value = '';
};
</script>

<style scoped>
.scroll-y { overflow-y: auto; }
</style>