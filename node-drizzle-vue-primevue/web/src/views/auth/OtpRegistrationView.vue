<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import QrCode from 'qrcode'
import { useApi } from '@/services/network/http.service'
import OtpInput from '@/components/OtpInput.vue'
import { useAuth } from '@/services/auth/auth.service'

const auth = useAuth()
const router = useRouter()
const toast = useToast()
const api = useApi()
const otpQrCode = ref(null)
const otpCode = ref(null)
const proceed = ref(true)
const isVerifying = ref(false)

onMounted(() => {
  const storedUser = auth.getUser()
  
  if(!storedUser) {
    toast.add({ severity: 'warn', summary: 'Registro de 2FA', detail: 'Não há usuário para registro de 2FA', life: 10000 })
    router.push({ name: 'signin' })
    return
  }

  if (storedUser?.otpVerified) {
    proceed.value = false
    return
  }

  api.post('/api/v1/auth/otp/actions/start-registration')
    .then(({ data }) => {
      QrCode.toCanvas(otpQrCode.value, data.tokenUri, { width: 150 })
    }).catch((error) => {
      toast.add({ severity: 'warn', summary: 'Registro de 2FA', detail: 'Atualize a página para tentar novamente', life: 10000 });
    })
})

function onVerify() {
  if(!otpCode.value?.length) {
    toast.add({ severity: 'warn', summary: 'Registro de 2FA', detail: 'Informe um código para validação', life: 5000 })
    return
  }

  isVerifying.value = true
  api.post('/api/v1/auth/otp/actions/finish-registration', { code: otpCode.value })
    .then(({ data }) => {
      isVerifying.value = false

      auth.signIn(data.token)

      router.push({ name: 'app' })
    })
    .catch((error) => {
      isVerifying.value = false
      toast.add({ severity: 'error', summary: 'Registro de 2FA', detail: 'Registro recusado', life: 10000 });
    })
}
</script>

<template>
  <div class="content min-h-screen flex flex-wrap align-content-center justify-content-center">
    <div class="card py-8 flex justify-content-center">
      <div v-if="proceed" class="w-23rem">
        <div class="text-center">
          <div class="inline-block flex-wrap align-content-center justify-content-center">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Registrar 2FA</h1>
        </div>

        <br>

        <div class="flex flex-wrap align-content-center justify-content-center">
          <canvas ref="otpQrCode" id="otp_qrcode" width="150" class="border-1 border-300 border-round"></canvas>
        </div>

        <div class="text-center my-3 text-color-secondary">
          Por favor, utilize um app de autenticação de sua escolha para ler o código Qr acima e informe o número gerado.
        </div>

        <div class="my-5">
          <OtpInput v-model="otpCode" />
        </div>

        <Button type="buttom" severity="primary" label="Registrar" class="font-bold uppercase w-full" :loading="isVerifying" @click="onVerify">
        </Button>
      </div>

      <div v-else class="w-20rem">
        <div class="text-center">
          <div class="inline-block flex-wrap align-content-center justify-content-center">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Registro de 2FA</h1>
        </div>

        <div class="text-center my-3 text-color-secondary">
          Você já registrou a autenticação em duas etapas (2FA).
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