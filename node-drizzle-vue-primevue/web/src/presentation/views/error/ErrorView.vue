<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function onBack() {
  router.push({ path: '/' })
}
</script>

<template>
  <div class="flex flex-column justify-content-center align-items-center h-screen w-screen">
    <div class="w-30rem text-center">
      <h1 class="text-8xl mb-0">ooOPS!</h1>
      <h2 class="text-2xl mt-0 mb-6 text-color-secondary">Erro 404: Página não encontrada</h2>
      <div class="flex justify-content-center">
        <div class="w-21rem">
          <Button severity="primary" class="border-pill font-bold uppercase px-5" @click="onBack">
            <div class="text-center w-full">Voltar</div>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>