import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ProposalView from '../views/ProposalView.vue';
import ProposalCreate from '../views/ProposalCreate.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/proposal/:id', name: 'ProposalView', component: ProposalView },
  { path: '/create', name: 'ProposalCreate', component: ProposalCreate },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;