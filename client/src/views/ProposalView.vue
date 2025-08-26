<template>
  <v-container class="py-6">
    <v-card v-if="proposal">
      <v-card-title>{{ proposal.title }}</v-card-title>
      <v-card-subtitle>Status: <v-chip :color="statusColor">{{ proposal.status }}</v-chip></v-card-subtitle>
      <v-card-text>
        <v-tabs v-model="activeTab" class="mb-4">
          <v-tab value="for">Summary</v-tab>
          <v-tab value="details">Details</v-tab>
          <v-tab value="media">Media</v-tab>
          <v-tab value="contributors">Contributors</v-tab>
          <v-tab value="comments">Comments</v-tab>
        </v-tabs>
        <v-window v-model="activeTab">
          <v-window-item value="for">
            <p>{{ proposal.summary }}</p>
            <v-divider class="my-4"></v-divider>
            <h3>Voting Results</h3>
            <div v-if="voteCounts.for + voteCounts.against + voteCounts.abstain > 0">
              <!-- Zameni v-chart sa v-doughnut-chart ako koristis Vuetify Chart komponente, ili koristi Chart.js direktno -->
              <canvas ref="chartCanvas" style="max-height: 200px;"></canvas>
            </div>
            <p v-else>No votes yet.</p>
          </v-window-item>
          <v-window-item value="details">
            <p><strong>Problem:</strong> {{ proposal.details.problem }}</p>
            <p><strong>Solution:</strong> {{ proposal.details.solution }}</p>
            <p><strong>Estimated Cost:</strong> {{ proposal.details.cost }}</p>
            <p><strong>Expected Impact:</strong> {{ proposal.details.impact }}</p>
          </v-window-item>
          <v-window-item value="media">
            <p>No media available.</p>
          </v-window-item>
          <v-window-item value="contributors">
            <v-list>
              <v-list-item v-for="c in contributors" :key="c.id">
                <v-list-item-avatar>
                  <v-img :src="c.avatar"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ c.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ c.role }} ({{ c.share }}%)</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip :color="getContributionColor(c.share)">{{ c.share }}%</v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-window-item>
          <v-window-item value="comments">
            <v-text-field v-model="newComment" label="Add a comment" @keyup.enter="postComment"></v-text-field>
            <v-list class="scroll-y" style="max-height: 200px;">
              <v-list-item v-for="c in comments" :key="c.id">
                <v-list-item-avatar>
                  <v-img :src="getUserAvatar(c.userId)"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ userName(c.userId) }}</v-list-item-title>
                  <v-list-item-subtitle>{{ c.text }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-window-item>
        </v-window>
        <v-divider class="my-4"></v-divider>
        <div v-if="userVote">
          <v-alert type="info">
            You have voted <strong>{{ userVote }}</strong> for this proposal. Voting cannot be changed.
          </v-alert>
        </div>
        <v-btn v-else color="primary" :disabled="loading" @click="openVote('for')">Vote For</v-btn>
        <v-btn color="error" :disabled="loading" @click="openVote('against')" class="ml-2">Vote Against</v-btn>
        <v-btn color="warning" :disabled="loading" @click="openVote('abstain')" class="ml-2">Abstain</v-btn>
        <v-dialog v-model="voteDialog" max-width="400">
          <v-card>
            <v-card-title>Confirm Vote</v-card-title>
            <v-card-text>Are you sure you want to vote <strong>{{ voteLabel(votePending) }}</strong>?</v-card-text>
            <v-card-actions>
              <v-btn @click="voteDialog = false">Cancel</v-btn>
              <v-btn color="primary" :loading="loading" @click="confirmVote">Confirm</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
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
let _chart = null;

onMounted(async () => {
  await Promise.all([
    store.fetchProposals(),
    store.fetchUsers(),
    store.fetchMunicipalities(),
    store.fetchCategories(),
  ]);
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
const userVote = computed(async () => {
  if (!authStore.currentUser) return null;
  const userId = authStore.currentUser.id;
  const { data, error } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('proposal_id', route.params.id)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 znači da nema rezultata
  return data?.vote_type ? (data.vote_type === 'for' ? 'FOR' : data.vote_type === 'against' ? 'AGAINST' : 'ABSTAIN') : null;
});

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
  if (await userVote.value || !authStore.currentUser) return; // Provera asinhronog userVote
  loading.value = true;
  try {
    await store.voteProposal(parseInt(route.params.id), votePending.value);
    voteDialog.value = false;
    await store.fetchProposals();
    renderChart();
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