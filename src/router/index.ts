import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DetailView from '@/views/DetailView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import SubmitView from '@/views/SubmitView.vue'
import StatsView from '@/views/StatsView.vue'
import EditView from '@/views/EditView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sample/:id',
      name: 'detail',
      component: DetailView,
      props: true,
    },
    {
      path: '/sample/:id/edit',
      name: 'edit',
      component: EditView,
      props: true,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
    },
    {
      path: '/submit',
      name: 'submit',
      component: SubmitView,
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
    },
  ],
})

export default router
