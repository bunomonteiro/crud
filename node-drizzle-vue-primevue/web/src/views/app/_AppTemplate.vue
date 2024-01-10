
<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { RouterView } from 'vue-router'
import { usePrimeVue } from 'primevue/config';

import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()
const PrimeVue = usePrimeVue();

const menu = ref([
  {
    label: 'Início',
    icon: 'pi pi-home',
    route: { name: 'app' }
  },
  {
    label: 'Configurações',
    icon: 'pi pi-cog',
    items: [
      {
        label: 'Usuários',
        icon: 'pi pi-user',
        route: { name: 'users' }
      },
      {
        label: 'Histórico',
        icon: 'pi pi-history',
        route: { name: 'user-histories' }
      },
    ]
  },
])

function changeTheme(dark) {
  if(appStore.darkTheme != dark) {
    appStore.toggleTheme()
  }
}

watch(() => appStore.darkTheme, (dark) => {
  if(dark) {
    PrimeVue.changeTheme('lara-light-blue', 'lara-dark-blue', 'theme-link', () => {});
  } else {
    PrimeVue.changeTheme('lara-dark-blue', 'lara-light-blue', 'theme-link', () => {});
  }
})

onBeforeMount(() => {
  changeTheme(appStore.darkTheme)
})
</script>

<template>
  <div class="wrapper flex align-items-stretch w-full">
    <div class="page-wrapper flex flex-column w-full">
      <Menubar :model="menu" class="m-5">
        <template #start>
          <Image src="/public/images/logo.png" height="30" />
        </template>

        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item?.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                  <span :class="item.icon" />
                  <span class="ml-2">{{ item.label }}</span>
              </a>
          </router-link>
          <a v-else-if="item?.url" v-ripple :href="item?.url" :target="item.target" v-bind="props.action">
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
              <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
          <a v-else v-bind="props.action">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </template>

        <template #end>
          <div class="flex align-items-center gap-2">
            <Button v-if="appStore.darkTheme" icon="pi pi-sun" text rounded v-tooltip.left="'Tema claro'" class="text-color" @click="changeTheme(false)" />
            <Button v-else icon="pi pi-moon" text rounded v-tooltip.left="'Tema escuro'" class="text-color" @click="changeTheme(true)" />
          </div>
        </template>
      </Menubar>

      <Breadcrumb :model="appStore.breadcrumb" class="surface-ground border-none mx-5" />

      <router-view class="page w-full" />

      <footer class="text-center py-3 text-color-secondary">
        Made with <i class="pi pi-heart-fill text-red-600"></i> by <a href="//brunomonteiro.dev" class="text-color-secondary no-underline hover:text-color" target="_blank">Bruno Monteiro</a>. © All rights reserved {{ new Date().getFullYear() }}.
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes heartbeat
{
  0% { transform: scale( .75 ); }
  20% { transform: scale( 1 ); }
  40% { transform: scale( .75 ); }
  60% { transform: scale( 1 ); }
  80% { transform: scale( .75 ); }
  100% { transform: scale( .75 ); }
}

.wrapper {
  .page-wrapper {
    --h-page-breadcrumb: 36px;
    --h-page-footer: 135px;
    
    .page {
      min-height: calc(100vh - var(--h-page-breadcrumb) - var(--h-page-footer));
    }

    footer {
      .pi-heart-fill {
        animation: heartbeat 1s infinite;
      }
    }
  }
}
</style>