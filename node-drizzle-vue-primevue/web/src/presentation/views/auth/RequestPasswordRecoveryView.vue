<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { useField, useForm } from 'vee-validate'

import { useApi } from '@/adapters/network/http.service'
import { RequestPasswordRecoveryUseCase } from '@/domain/usecases/auth/request_password_recovery.uc'
import { usernameSchema } from '@/domain/validations/user.schemas'

const toast = useToast()
const api = useApi()
const requestPasswordRecoveryUC = new RequestPasswordRecoveryUseCase(api)
const { handleSubmit } = useForm()
const isRequesting = ref(false)

const { value: username, errorMessage: usernameError } = useField('username', (value) => usernameSchema.validate(value).error?.message || true)

const onRequestPasswordRecovery = handleSubmit(async () => {
  isRequesting.value = true
  const response = await requestPasswordRecoveryUC.handle({ username: username.value })
  isRequesting.value = false

  if(response.error) {
    toast.add({ severity: 'error', summary: 'Recuperação de Senha', detail: response.message, life: 10000 });
    return
  }
  
  toast.add({ severity: 'success', summary: 'Recuperação de Senha', detail: 'Foi enviado para o seu email um endereço para recuperação de senha.', life: 10000 });
})
</script>

<template>
  <div class="content min-h-screen flex flex-wrap align-content-center justify-content-center">
    <div class="card py-8 flex justify-content-center">
      <form @submit="onRequestPasswordRecovery" class="w-21rem">
        <div class="text-center">
          <div class="inline-block flex-wrap align-content-center justify-content-center">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Recuperar Senha</h1>
        </div>

        <div class="field flex flex-column gap-1">
          <span class="p-input-icon-left">
            <i class="pi pi-user" />
            <InputText v-model="username" :class="{ 'p-invalid': usernameError }" size="large" placeholder="Nome de usuário" />
          </span>
          <small v-if="usernameError" class="text-red-200" v-text="usernameError"></small>
        </div>

        <Button type="submit" severity="primary" label="Recuperar" class="font-bold uppercase w-full" :loading="isRequesting">
        </Button>

        <br>

        <div class="text-center mt-5">
          ou tente <RouterLink :to="{name: 'signin'}" class="text-primary">acessar</RouterLink> novamente!
        </div>
      </form>
    </div>
  </div>
</template>