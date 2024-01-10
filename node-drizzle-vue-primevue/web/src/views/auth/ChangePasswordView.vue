<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { useApi } from '@/services/network/http.service'
import { useField, useForm } from 'vee-validate'
import Joi, { joiMessages } from '@/services/helpers/joi.helpers'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const api = useApi()
const { handleSubmit } = useForm()

const isChanging = ref(false)
let token = null
const passwordSchema = Joi.string()
  .min(8).max(128)
  .regex(/[0-9]+/, { name: 'ao menos um número' }) // Ao menos um número em qualquer posição
  .regex(/[a-z]+/, { name: 'ao menos uma letra minúscula' }) // Ao menos uma letra minúscula em qualquer posição
  .regex(/[A-Z]+/, { name: 'ao menos uma leta maiúscula' }) // Ao menos uma letra maiúscula em qualquer posição
  .required().label("Senha")
  .messages(joiMessages)
const confirmPasswordSchema = Joi.object({
  password: passwordSchema,
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).label('Confirmação').messages({...joiMessages, "any.only": '"Confirmação" deve ser igual a "Senha"'})
})
Joi.string().min(3).max(128).required().label("Senha").messages(joiMessages)

const { value: password, errorMessage: passwordError } = useField('password', (value) => passwordSchema.validate(value).error?.message || true)
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', (value) => confirmPasswordSchema.validate({
  password: password.value,
  confirmPassword: value
}).error?.message || true)

onBeforeMount(() => { 
  token = route.params.token 

  if(!token) {
    toast.add({ severity: 'warn', summary: 'Atualizar Senha', detail: 'Não há usuário para atualizar senha', life: 10000 })
    router.push({ name: 'signin' })
    return
  }
})

const onChangePassword = handleSubmit(() => {
  isChanging.value = true
  api.post(`/api/v1/auth/actions/change-password/${token}`, {
    password: password.value
  }).then(({data}) => {
    isChanging.value = false
    if(data.error) {
      toast.add({ severity: 'error', summary: 'Atualizar Senha', detail: error.message, life: 10000 })
      return
    }

    toast.add({ severity: 'success', summary: 'Atualizar Senha', detail: 'Senha atualizada com sucesso', life: 10000 })
    router.push({ name: 'signin' })
  }).catch(({response}) => {
    isChanging.value = false
    const errorMessage = response?.data?.error ? response?.data.message : 'Solicite a alteração de senha novamente.'
    toast.add({ severity: 'error', summary: 'Atualizar Senha', detail: errorMessage, life: 10000 })
  })
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