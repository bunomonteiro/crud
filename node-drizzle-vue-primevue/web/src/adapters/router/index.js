import { createRouter, createWebHistory } from 'vue-router'

import { useAuth } from '@/adapters/auth/auth.service'
import { useAppStore } from '@/adapters/stores/app.store'
import configurations from '@/adapters/configurations/configurations'

import Template from '@/presentation/views/_Template.vue'
import AuthTemplate from '@/presentation/views/auth/_AuthTemplate.vue'
import AppTemplate from '@/presentation/views/app/_AppTemplate.vue'

const auth = useAuth()

function RouterFactory(pinia) {
  const appStore = useAppStore(pinia)
  
  const router = createRouter({
    history: createWebHistory(configurations.app.basePath),
    base: configurations.app.basePath,
    routes: [
      {
        path: '/',
        component: Template,
        children: [
          {
            path: '',
            name: 'home',
            component: () => import('@/presentation/views/HomeView.vue')
          }
        ]
      },
      {
        path: '/auth',
        component: AuthTemplate,
        children: [
          {
            path: '',
            redirect: { name: 'signin' }
          },
          {
            path: 'signin',
            name: 'signin',
            component: () => import('@/presentation/views/auth/SignInView.vue')
          },
          {
            path: 'signup',
            name: 'signup',
            component: () => import('@/presentation/views/auth/SignUpView.vue')
          },
          {
            path: 'request-password-recovery',
            name: 'request-password-recovery',
            component: () => import('@/presentation/views/auth/RequestPasswordRecoveryView.vue')
          },
          {
            path: 'change-password/:token',
            name: 'change-password',
            component: () => import('@/presentation/views/auth/ChangePasswordView.vue')
          },
          {
            path: 'otp-registration',
            name: 'otp-registration',
            component: () => import('@/presentation/views/auth/OtpRegistrationView.vue')
          },
          {
            path: 'validate-otp',
            name: 'validate-otp',
            component: () => import('@/presentation/views/auth/ValidateOtpView.vue')
          },
        ]
      },
      {
        path: '/app',
        component: AppTemplate,
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: '',
            name: 'app',
            component: () => import('@/presentation/views/app/HomeView.vue')
          },
          {
            path: 'blank',
            name: 'blank',
            meta: {
            },
            component: () => import('@/presentation/views/app/_BlankView.vue')
          },
          {
            path: 'settings',
            name: 'settings',
            meta: {
            },
            component: () => import('@/presentation/views/app/settings/SettingsView.vue')
          },
          // USERS
          {
            path: 'settings/users',
            name: 'users',
            meta: {
              breadcrumb: [
                { icon: 'pi pi-cog mr-2', url: '/app/settings', label: 'Configurações' },
                { icon: 'pi pi-user mr-2', url: '/app/settings/users', label: 'Usuários' }
              ]
            },
            component: () => import('@/presentation/views/app/settings/users/ListUsersView.vue')
          },
          {
            path: 'settings/user-histories',
            name: 'user-histories',
            meta: {
              breadcrumb: [
                { icon: 'pi pi-cog mr-2', url: '/app/settings', label: 'Configurações' },
                { icon: 'pi pi-history mr-2', url: '/app/settings/user-histories', label: 'Histórico' }
              ]
            },
            component: () => import('@/presentation/views/app/settings/users/UserHistoriesView.vue')
          }
        ]
      },
    ]
  })
  
  router.beforeEach((to, from) => {
    if(to.meta?.requiresAuth && !auth.isLoggedIn()){
      return {
        name: 'signin',
        query: { redirect: to.fullPath }
      }
    }
  
    appStore.updateBreadcrumb(to)
  })

  return router;
}

export default RouterFactory
