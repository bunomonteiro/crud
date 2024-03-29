<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import QrCode from 'qrcode'

import { useApi } from '@/adapters/network/http.service'
import { GetOtpUriUseCase } from '@/domain/usecases/auth/get_otp_uri.uc'
import { ValidateOtpUseCase } from '@/domain/usecases/auth/validate_otp.uc'
import { useAuth } from '@/adapters/auth/auth.service'
import OtpInput from '@/presentation/components/OtpInput.vue'

const auth = useAuth()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const api = useApi()
const getOtpUriUC = new GetOtpUriUseCase(api)
const validateOtpUC = new ValidateOtpUseCase(api)
const otpQrCode = ref(null)
const otpCode = ref(null)
const proceed = ref(true)
const isValidating = ref(false)

async function renderQrCode() {
  const response = await getOtpUriUC.handle()

  if(response.error){
    toast.add({ severity: 'warn', summary: 'Validação de 2FA', detail: response.message, life: 10000 });
    return    
  }

  QrCode.toCanvas(otpQrCode.value, response.data, { width: 150 })
}

async function onValidate() {
  if(!otpCode.value?.length) {
    toast.add({ severity: 'warn', summary: 'Validação de 2FA', detail: 'Informe um código para validação', life: 5000 })
    return
  }

  isValidating.value = true  
  const response = await validateOtpUC.handle({ code: otpCode.value })
  isValidating.value = false

  if(response.error) {
    toast.add({ severity: 'error', summary: 'Validação de 2FA', detail: response.message, life: 10000 });
    return
  }

  auth.signIn(response.data)

  if(route.query?.redirect){
    router.push({ path: route.query?.redirect })
  } else {
    router.push({ name: 'app' })
  }
}

onMounted(async () => {
  const user = auth.getUser()
  
  if(!user) {
    toast.add({ severity: 'warn', summary: 'Validação de 2FA', detail: 'Não há usuário a ser validado', life: 10000 })
    router.push({ name: 'signin', query: route.query })
    return
  }

  if (!user?.otpEnabled || !user?.otpVerified) {
    proceed.value = false
    return
  }

  await renderQrCode()
})
</script>:

<template>
  <div class="content min-h-screen flex flex-wrap align-content-center justify-content-center">
    <div class="card py-8 flex justify-content-center">
      <div v-if="proceed" class="w-23rem">
        <div class="text-center">
          <div class="inline-block flex-wrap align-content-center justify-content-center">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Validar 2FA</h1>
        </div>

        <br>

        <div class="flex flex-wrap align-content-center justify-content-center">
          <canvas ref="otpQrCode" id="otp_qrcode" width="150" class="border-1 border-300 border-round"></canvas>
        </div>

        <div class="text-center my-3 text-color-secondary">
          Por favor, utilize o seu app de autenticação para ler o código Qr acima e informe o número gerado.
        </div>

        <div class="my-5">
          <OtpInput v-model="otpCode" />
        </div>

        <Button type="buttom" severity="primary" label="Validar" class="font-bold uppercase w-full" :loading="isValidating" @click="onValidate">
        </Button>
      </div>

      <div v-else class="w-20rem">
        <div class="text-center">
          <div class="inline-block flex-wrap align-content-center justify-content-center">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Validar 2FA</h1>
        </div>

        <div class="text-center my-3 text-color-secondary">
          Você não possui autenticação em duas etapas (2FA) configurada.
        </div>

        <RouterLink :to="{ name: 'signin' }">
          <Button type="buttom" severity="primary" class="font-bold uppercase w-full mt-3">
            <div class="text-center w-full">Voltar</div>
          </Button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>