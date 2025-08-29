import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Profile from '../views/Profile.vue'
import ProposalCreate from '../views/ProposalCreate.vue'
import ProposalView from '../views/ProposalView.vue'
import ProposalEdit from '../views/ProposalEdit.vue'
import Drafts from '../views/Drafts.vue'
import ContributionReview from '../views/ContributionReview.vue'
import Settings from '../views/Settings.vue'
import UserProfile from '../views/UserProfile.vue'
import { useAuthStore } from '../stores/auth'

const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    next()
  } else {
    next('/login')
  }
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/create',
    name: 'CreateProposal',
    component: ProposalCreate,
    beforeEnter: requireAuth
  },
  {
    path: '/proposal/:id',
    name: 'ProposalView',
    component: ProposalView
  },
  {
    path: '/proposal/:id/edit',
    name: 'EditProposal',
    component: ProposalEdit,
    beforeEnter: requireAuth
  },
  {
    path: '/proposal/:id/contribution/:contributionId',
    name: 'ContributionReview',
    component: ContributionReview,
    beforeEnter: requireAuth
  },
  {
    path: '/drafts',
    name: 'Drafts',
    component: Drafts,
    beforeEnter: requireAuth
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    beforeEnter: requireAuth
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;