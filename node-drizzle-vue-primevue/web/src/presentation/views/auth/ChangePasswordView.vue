<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { useField, useForm } from 'vee-validate'

import { useApi } from '@/adapters/network/http.service'
import { ChangePasswordUseCase } from '@/domain/usecases/auth/change_password.uc'
import { passwordSchema, confirmPasswordSchema } from '@/domain/validations/user.schemas'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const api = useApi()
const changePasswordUC = new ChangePasswordUseCase(api)
const { handleSubmit } = useForm()

const isChanging = ref(false)
let token = null

const { value: password, errorMessage: passwordError } = useField('password', (value) => passwordSchema.validate(value).error?.message || true)
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', (value) => confirmPasswordSchema.validate({ password: password.value, confirmPassword: value }).error?.message || true)

const onChangePassword = handleSubmit(async () => {
  isChanging.value = true
  
  const response = await changePasswordUC.handle({
    token: token,
    password: password.value
  })
  
  isChanging.value = false

  if(response.error) {
    toast.add({ severity: 'error', summary: 'Atualizar Senha', detail: response.message, life: 10000 })
    return
  }

  toast.add({ severity: 'success', summary: 'Atualizar Senha', detail: 'Senha atualizada com sucesso', life: 10000 })
  router.push({ name: 'signin' })
})

onBeforeMount(() => { 
  token = route.params.token 

  if(!token) {
    toast.add({ severity: 'warn', summary: 'Atualizar Senha', detail: 'Não há usuário para atualizar senha', life: 10000 })
    router.push({ name: 'signin' })
    return
  }
})
</script>

<template>
  <div class="content min-h-screen flex flex-wrap align-content-center justify-content-center">
    <div class="card py-8 flex justify-content-center">
      <form @submit="onChangePassword" class="w-21rem">
        <div class="text-center">
          <div class="inline-block">
            <Image src="/images/logo.png" image-class="inline-block" width="50" />
          </div>
          <h1 class="font-medium">Atualizar Senha</h1>
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

        <Button type="submit" severity="primary" label="Atualizar" class="font-bold uppercase w-full" :loading="isChanging">
        </Button>

        <br>

        <div class="text-center mt-5">
          <span>lembrou da senha antiga?</span> <RouterLink :to="{name: 'signin'}" class="text-primary">Então acesse!</RouterLink>
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