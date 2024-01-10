<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { useApi } from '@/services/network/http.service'
import { useField, useForm } from 'vee-validate'
import Joi, { joiMessages } from '@/services/helpers/joi.helpers'

const toast = useToast()
const api = useApi()
const { handleSubmit } = useForm()
const isRequesting = ref(false)

const usernameSchema = Joi.string().min(3).max(32).required().label("Login").messages(joiMessages)

const { value: username, errorMessage: usernameError } = useField('username', (value) => usernameSchema.validate(value).error?.message || true)

const onRequestPasswordRecovery = handleSubmit(() => {
  isRequesting.value = true
  api.post('/api/v1/auth/actions/request-password-recovery', {
    username: username.value
  }).then(() => {
    isRequesting.value = false
    toast.add({ severity: 'success', summary: 'Recuperação de Senha', detail: 'Foi enviado para o seu email um endereço para recuperação de senha.', life: 10000 });
  }).catch((error) => {
    isRequesting.value = false
    toast.add({ severity: 'error', summary: 'Recuperação de Senha', detail: 'Não foi possível solicitar a recuperação de senha', life: 10000 });
  })
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