import { createRouter, createWebHistory } from 'vue-router';
import { requireAuth, requireGuest } from '../middleware/auth';
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
  { path: '/login', component: Login, beforeEnter: requireGuest },
  { path: '/register', component: Register, beforeEnter: requireGuest },
  { path: '/proposal/:id', name: 'ProposalView', component: ProposalView },
  { path: '/proposal/:id/edit', name: 'ProposalEdit', component: ProposalEdit, beforeEnter: requireAuth },
  { path: '/proposal/:id/contribute', name: 'ProposalContribute', component: ProposalContribute, beforeEnter: requireAuth },
  { path: '/create', name: 'ProposalCreate', component: ProposalCreate, beforeEnter: requireAuth },
  { path: '/settings', name: 'Settings', component: Settings, beforeEnter: requireAuth },
  { path: '/profile', name: 'Profile', component: Profile, beforeEnter: requireAuth },
  { path: '/profile/:id', name: 'UserProfile', component: UserProfile }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;