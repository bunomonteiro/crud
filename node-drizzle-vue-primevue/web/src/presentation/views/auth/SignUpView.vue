<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { useField, useForm } from 'vee-validate'

import { useApi } from '@/adapters/network/http.service'
import { useAuth } from '@/adapters/auth/auth.service'
import { 
  nameSchema, 
  usernameSchema, 
  emailSchema, 
  passwordSchema, 
  confirmPasswordSchema
} from '@/domain/validations/user.schemas'
import { SignupUseCase } from '@/domain/usecases/auth/signup.uc'

const auth = useAuth()
const toast = useToast()
const router = useRouter()
const { handleSubmit } = useForm()
const api = useApi()
const signupUC = new SignupUseCase(api)

const isSigningUp = ref(false)

const { value: name, errorMessage: nameError } = useField('name', (value) => nameSchema.validate(value).error?.message || true)
const { value: username, errorMessage: usernameError } = useField('username', (value) => usernameSchema.validate(value).error?.message || true)
const { value: email, errorMessage: emailError } = useField('email', (value) => emailSchema.validate(value).error?.message || true)
const { value: password, errorMessage: passwordError } = useField('password', (value) => passwordSchema.validate(value).error?.message || true)
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', (value) => confirmPasswordSchema.validate({ password: password.value, confirmPassword: value }).error?.message || true)

const onSignUp = handleSubmit(async () => {
  isSigningUp.value = true
  const response = await signupUC.handle({
    name: name.value,
    username: username.value,
    email: email.value,
    password: password.value
  })
  
  isSigningUp.value = false

  if(response.error) {
    toast.add({ severity: 'error', summary: 'Criar conta', detail: response.message, life: 10000 })
    return
  }

  toast.add({ severity: 'success', summary: 'Criar conta', detail: 'Conta criada com sucesso', life: 10000 })
  auth.signIn(response.data)
  router.push({ name: 'otp-registration' })
})
</script>

<template>
  <div class="content min-h-screen flex flex-wrap align-content-center justify-content-center">
    <div class="card py-8 flex justify-content-center">
      <form @submit="onSignUp" class="w-21rem h-full">
        <div class="text-center">
          <div class="inline-block">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Criar Conta</h1>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText v-model="name" :class="{ 'p-invalid': nameError }" class="w-full" size="large" placeholder="Nome completo" />
          </span>
          <small v-if="nameError" class="text-red-200" v-text="nameError"></small>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText v-model="username" :class="{ 'p-invalid': usernameError }" class="w-full" size="large" placeholder="Login" />
          </span>
          <small v-if="usernameError" class="text-red-200" v-text="usernameError"></small>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <i class="pi pi-at" />
            <InputText v-model="email" :class="{ 'p-invalid': emailError }" class="w-full" size="large" placeholder="E-mail" />
          </span>
          <small v-if="emailError" class="text-red-200" v-text="emailError"></small>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <Password v-model="password" :class="{ 'p-invalid': passwordError }" class="password w-full" toggle-mask size="large" placeholder="Nova senha">
              <template #header>
                <h4>Informe uma nova senha</h4>
              </template>
              <template #footer>
                <Divider />
                <p class="mt-2">Sugestões</p>
                <ul class="pl-2 ml-2 mt-0 line-height-3">
                  <li>Ao menos uma letra minúscula</li>
                  <li>Ao menos uma letra maiúscula</li>
                  <li>Ao menos um número</li>
                  <li>No mínimo 8 caracteres</li>
                </ul>
              </template>
            </Password>
            <i class="pi pi-lock" />
          </span>
          <small v-if="passwordError" class="text-red-200" v-text="passwordError"></small>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <Password v-model="confirmPassword" :feedback="false" :class="{ 'p-invalid': confirmPasswordError }" class="password w-full" toggle-mask size="large" placeholder="Confirmar senha" />
            <i class="pi pi-lock" />
          </span>
          <small v-if="confirmPasswordError" class="text-red-200" v-text="confirmPasswordError"></small>
        </div>

        <Button type="submit" severity="primary" label="Criar" class="font-bold uppercase w-full" :loading="isSigningUp" />

        <br>

        <div class="text-center mt-5">
          <span>Já tem uma conta?</span> <RouterLink :to="{name: 'signin'}" class="text-primary">Então acesse!</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.password {
  :deep(input) {
    font-size: 1.25rem;
    padding: 0.9375rem;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    width: 100%;
  }
}
</style>