<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="7" lg="8">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-h5">{{ proposal.title }}</div>
            <div class="d-none d-md-flex align-center gap-2">
              <v-tooltip text="Za" location="bottom">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon color="success" variant="tonal" @click="openVote('for')">
                    <v-icon>mdi-thumb-up</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Protiv" location="bottom">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon color="error" variant="tonal" @click="openVote('against')">
                    <v-icon>mdi-thumb-down</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Uzdržan" location="bottom">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon color="warning" variant="tonal" @click="openVote('abstain')">
                    <v-icon>mdi-minus-circle</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              <v-btn color="primary" size="small" :to="`/proposal/${$route.params.id}/contribute`" prepend-icon="mdi-pencil">Edit Proposal</v-btn>
            </div>
          </v-card-title>
          <v-card-subtitle>
            {{ proposal.municipality }} • {{ proposal.category || 'General' }} • {{ proposal.author }} • {{ proposal.createdAt?.slice(0,10) }}
          </v-card-subtitle>
          <v-card-text>
            <div class="mb-3">
              <v-chip :color="statusColor" size="small">{{ proposal.status }}</v-chip>
            </div>
            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">Summary</div>
              <div>{{ proposal.summary }}</div>
            </div>
            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">Problem</div>
              <div>{{ proposal.details?.problem }}</div>
            </div>
            <div class="mb-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">Solution</div>
              <div>{{ proposal.details?.solution }}</div>
            </div>
            <div class="mb-4 d-flex gap-4">
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-1">Cost</div>
                <div>{{ proposal.details?.cost }}</div>
              </div>
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-1">Impact</div>
                <div>{{ proposal.details?.impact }}</div>
              </div>
            </div>
            <div v-if="proposal.media?.length" class="mb-4">
              <v-tooltip v-for="media in proposal.media" :key="media" location="top">
                <template #activator="{ props }">
                  <v-img v-bind="props" :src="media" max-height="200" class="mb-2" />
                </template>
                <v-img :src="media" height="300" width="auto" />
              </v-tooltip>
            </div>
            <v-card variant="outlined" class="mb-2">
              <v-card-title>Documents</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <div v-if="(proposal.media && proposal.media.length) || (proposal.documents && proposal.documents.length)">
                  <v-chip
                    v-for="doc in (proposal.documents || proposal.media || [])"
                    :key="doc"
                    class="ma-1"
                    variant="outlined"
                    :href="doc"
                    target="_blank"
                    clickable
                    prepend-icon="mdi-file"
                  >{{ extractFileName(doc) }}</v-chip>
                </div>
                <div v-else class="text-caption text-medium-emphasis">No documents attached.</div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
        
        <v-card class="mb-4">
          <v-card-title>Contributors</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row>
              <v-col v-for="c in contributors" :key="c.id" cols="12" sm="6">
                <v-card class="pa-2" :to="`/profile/${c.id}`" variant="outlined">
                  <div class="d-flex align-center">
                    <v-tooltip text="Preview" location="top">
                      <template #activator="{ props }">
                        <v-avatar v-bind="props" size="32" class="mr-3">
                          <v-img :src="c.avatar" />
                        </v-avatar>
                      </template>
                      <v-img :src="c.avatar" height="120" width="120" />
                    </v-tooltip>
                    <div class="flex-grow-1">
                      <div class="text-caption">{{ c.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ c.role }}</div>
                    </div>
                    <v-chip :color="getContributionColor(c.share)" size="small">{{ c.share }}%</v-chip>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Comments</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-textarea v-model="newComment" rows="2" placeholder="Write a comment..." auto-grow />
            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" size="small" :disabled="!newComment.trim()" @click="postComment">Post</v-btn>
            </div>
            <v-divider class="my-3" />
            <v-list density="compact">
              <v-list-item v-for="c in comments" :key="c.id">
                <template #prepend>
                  <v-avatar size="28">
                    <v-img :src="getUserAvatar(c.userId)" />
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">{{ userName(c.userId) }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ c.text }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="5" lg="4">
        <!-- Votes (lists) -->
        <v-card class="mb-4">
          <v-card-title>Votes</v-card-title>
          <v-divider></v-divider>
          <v-tabs v-model="activeTab" grow>
            <v-tab value="for">Za</v-tab>
            <v-tab value="against">Protiv</v-tab>
            <v-tab value="abstain">Uzdržan</v-tab>
          </v-tabs>
          <v-window v-model="activeTab">
            <v-window-item value="for">
              <v-card-text>
                <div class="scroll-y" style="max-height: 220px;">
                  <v-row>
                    <v-col v-for="uid in proposal.voters?.for || []" :key="`for-${uid}`" cols="12" sm="6">
                      <v-card class="pa-2" :to="`/profile/${uid}`" variant="outlined" size="small">
                        <div class="d-flex align-center">
                          <v-avatar size="28" class="mr-2">
                            <v-img :src="getUserAvatar(uid)" />
                          </v-avatar>
                          <div class="text-caption">{{ userName(uid) }}</div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-window-item>
            <v-window-item value="against">
              <v-card-text>
                <div class="scroll-y" style="max-height: 220px;">
                  <v-row>
                    <v-col v-for="uid in proposal.voters?.against || []" :key="`against-${uid}`" cols="12" sm="6">
                      <v-card class="pa-2" :to="`/profile/${uid}`" variant="outlined" size="small">
                        <div class="d-flex align-center">
                          <v-avatar size="28" class="mr-2">
                            <v-img :src="getUserAvatar(uid)" />
                          </v-avatar>
                          <div class="text-caption">{{ userName(uid) }}</div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-window-item>
            <v-window-item value="abstain">
              <v-card-text>
                <div class="scroll-y" style="max-height: 220px;">
                  <v-row>
                    <v-col v-for="uid in proposal.voters?.abstain || []" :key="`abstain-${uid}`" cols="12" sm="6">
                      <v-card class="pa-2" :to="`/profile/${uid}`" variant="outlined" size="small">
                        <div class="d-flex align-center">
                          <v-avatar size="28" class="mr-2">
                            <v-img :src="getUserAvatar(uid)" />
                          </v-avatar>
                          <div class="text-caption">{{ userName(uid) }}</div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>

        <!-- Votes Share chart -->
        <v-card class="mb-4">
          <v-card-title>Votes Share</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <div style="height:220px;">
              <canvas ref="chartCanvas" style="height:100%; width:100%"></canvas>
            </div>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>

    <v-dialog v-model="voteDialog" max-width="420">
      <v-card>
        <v-card-title>Confirm your vote</v-card-title>
        <v-card-text>
          Your vote ({{ voteLabel(votePending) }}) will be final and cannot be changed. Proceed?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="voteDialog=false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmVote">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useProposalStore } from '@/stores/proposal';
import { ref, nextTick } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, DoughnutController);
export default {
  setup() {
    const store = useProposalStore();
    store.fetchProposals();
    store.fetchUsers();
    const chartCanvas = ref(null);
    const activeTab = ref('for');
    const voteDialog = ref(false);
    const votePending = ref('for');
    const newComment = ref('');
    const comments = ref([]);
    return { store, chartCanvas, activeTab, voteDialog, votePending, newComment, comments };
  },
  computed: {
    proposal() {
      return this.store.proposals.find(p => p.proposalId === parseInt(this.$route.params.id)) || {};
    },
    statusColor() {
      return this.proposal.status === 'Approved' ? 'success' : 'warning';
    },
    voteCounts() {
      const voters = this.proposal.voters || {};
      const countsFromVoters = {
        for: Array.isArray(voters.for) ? voters.for.length : 0,
        against: Array.isArray(voters.against) ? voters.against.length : 0,
        abstain: Array.isArray(voters.abstain) ? voters.abstain.length : 0,
      };
      const anyVoters = countsFromVoters.for + countsFromVoters.against + countsFromVoters.abstain > 0;
      if (anyVoters) return countsFromVoters;
      return {
        for: this.proposal.votes?.for ?? 0,
        against: this.proposal.votes?.against ?? 0,
        abstain: this.proposal.votes?.abstain ?? 0,
      };
    },
    contributors() {
      return [
        { id: 1, name: 'Ana Petrović', role: 'Author', share: 60, avatar: 'https://i.pravatar.cc/40?img=11' },
        { id: 2, name: 'Marko Marković', role: 'Reviewer', share: 25, avatar: 'https://i.pravatar.cc/40?img=22' },
        { id: 3, name: 'Ivana Jovanović', role: 'Contributor', share: 15, avatar: 'https://i.pravatar.cc/40?img=33' },
      ];
    },
  },
  methods: {
    async renderChart() {
      await nextTick();
      const canvas = this.chartCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (this._chart) {
        try { this._chart.destroy(); } catch {}
        this._chart = null;
      }
      const data = [60, 15, 25];
      this._chart = new Chart(ctx, {
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
    },
    userName(id) {
      const u = this.store.users.find(u => u.id === id);
      return u ? u.name : `User ${id}`;
    },
    getUserAvatar(id) {
      return `https://i.pravatar.cc/32?img=${(id % 70) + 1}`;
    },
    getContributionColor(share) {
      if (share >= 50) return 'success';
      if (share >= 25) return 'primary';
      return 'warning';
    },
    extractFileName(path) {
      if (!path) return '';
      try { return path.split('/').pop(); } catch { return path; }
    },
    openVote(type) {
      this.votePending = type;
      this.voteDialog = true;
    },
    voteLabel(type) {
      return type === 'for' ? 'Za' : type === 'against' ? 'Protiv' : 'Uzdržan';
    },
    async confirmVote() {
      this.voteDialog = false;
      await this.store.voteProposal(parseInt(this.$route.params.id), this.votePending);
      this.renderChart();
    },
    postComment() {
      const text = this.newComment.trim();
      if (!text) return;
      this.comments.unshift({ id: Date.now(), userId: 1 + (this.comments.length % 70), text });
      this.newComment = '';
    },
  },
  mounted() {
    this.renderChart();
  },
  watch: {
    proposal: {
      handler() { this.renderChart(); },
      deep: true,
    },
  },
};
</script>

<style scoped>
.scroll-y { overflow-y: auto; }
</style>