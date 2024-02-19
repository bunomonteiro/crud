<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { useField, useForm } from 'vee-validate'

import { useApi } from '@/adapters/network/http.service'
import { useAuth } from '@/adapters/auth/auth.service'
import { usernameSchema, passwordSchema } from '@/domain/validations/user.schemas'
import { SigninUseCase } from '@/domain/usecases/auth/signin.uc'

const auth = useAuth()
const toast = useToast()
const router = useRouter()
const route = useRoute()
const api = useApi()
const signinUC = new SigninUseCase(api)
const { handleSubmit } = useForm()
const isLoggingIn = ref(false)

const { value: username, errorMessage: usernameError } = useField('username', (value) => usernameSchema.validate(value).error?.message || true)
const { value: password, errorMessage: passwordError } = useField('password', (value) => passwordSchema.validate(value).error?.message || true)

onBeforeMount(() => { auth.signOut() })

const onLogin = handleSubmit(async () => {
  isLoggingIn.value = true
  
  const response = await signinUC.handle({
    username: username.value,
    password: password.value
  })

  isLoggingIn.value = false

  if(response.error) {
    toast.add({ severity: 'error', summary: 'Acesso Recusado', detail: response.message, life: 10000 })
    return
  }

  username.value = null
  password.value = null

  const user = auth.signIn(response.data)

  if (!user.otpEnabled || !user.otpVerified) {
    router.push({ name: 'otp-registration' })
    return
  }

  router.push({ 
    name: 'validate-otp',
    query: route.query
  })
})
</script>

<template>
  <div class="content min-h-screen flex flex-wrap align-content-center justify-content-center">
    <div class="card py-8 flex justify-content-center">
      <form @submit="onLogin" class="w-21rem">
        <div class="text-center">
          <div class="inline-block">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Entrar</h1>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText v-model="username" :class="{ 'p-invalid': usernameError }" size="large" placeholder="Nome de usuário" />
          </span>
          <small v-if="usernameError" class="text-red-200" v-text="usernameError"></small>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <i class="pi pi-lock" />
            <InputText v-model="password" :class="{ 'p-invalid': passwordError }" type="password" size="large" placeholder="Senha" />
          </span>
          <small v-if="passwordError" class="text-red-200" v-text="passwordError"></small>
        </div>

        <div class="field text-right">
          <RouterLink :to="{name: 'request-password-recovery'}" class="text-primary">Esqueceu a senha?</RouterLink>
        </div>

        <Button type="submit" severity="primary" label="Entrar" class="font-bold uppercase w-full" :loading="isLoggingIn">
        </Button>

        <br>

        <div class="text-center mt-5">
          <span>não tem uma conta?</span> <RouterLink :to="{name: 'signup'}" class="text-primary">Crie uma conta!</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>