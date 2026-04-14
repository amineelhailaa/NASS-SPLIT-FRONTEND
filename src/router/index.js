import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import FAQView from '../views/FAQView.vue'
import ContactView from '../views/ContactView.vue'
import SignUpView from '../views/SignUpView.vue'
import LoginView from '../views/LoginView.vue'
import GroupsView from '../views/GroupsView.vue'
import GroupDetailView from '../views/GroupDetailView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import JoinView from '../views/JoinView.vue'
import JoinByCodeView from '../views/JoinByCodeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/faq',
      name: 'faq',
      component: FAQView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideNavbar: true, guestOnly: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { hideNavbar: true, guestOnly: true },
    },
    {
      path: '/groups',
      name: 'groups',
      component: GroupsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/groups/:id',
      name: 'group-detail',
      component: GroupDetailView,
      meta: { requiresAuth: true, hideNavbar: true },
    },
    {
      path: '/join/:token',
      name: 'join-invitation',
      component: JoinView,
      meta: { requiresAuth: true, hideNavbar: true },
    },
    {
      path: '/groups/join/:code',
      name: 'join-by-code',
      component: JoinByCodeView,
      meta: { requiresAuth: true, hideNavbar: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'groups' }
  }
})

export default router
