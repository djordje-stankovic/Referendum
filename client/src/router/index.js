import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ProposalView from '../views/ProposalView.vue';
import ProposalCreate from '../views/ProposalCreate.vue';
import ProposalEdit from '../views/ProposalEdit.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Settings from '../views/Settings.vue';
import Profile from '../views/Profile.vue';
import ProposalContribute from '../views/ProposalContribute.vue';
import UserProfile from '../views/UserProfile.vue';

const routes = [
 
  { path: '/', name: 'Home', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/proposal/:id', name: 'ProposalView', component: ProposalView },
  { path: '/proposal/:id/edit', name: 'ProposalEdit', component: ProposalEdit },
  { path: '/proposal/:id/contribute', name: 'ProposalContribute', component: ProposalContribute },
  { path: '/create', name: 'ProposalCreate', component: ProposalCreate },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/profile/:id', name: 'UserProfile', component: UserProfile }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;