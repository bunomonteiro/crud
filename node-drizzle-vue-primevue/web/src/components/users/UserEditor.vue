<script setup>
import { defineProps, defineModel, defineEmits, ref, watch } from 'vue'
import { useToast } from "primevue/usetoast"
import { compare } from 'fast-json-patch/index.mjs'

import { useApi } from '@/services/network/http.service'

const emit = defineEmits(['onSaved'])
const props = defineProps({ user: { type: Object } })
const visible = defineModel('visible', { required: true })

const api = useApi()
const toast = useToast()

const data = ref({
  user: props.user ? { ...props.user } : null,
  isEditing: false,
  isSaving: false
})

watch(() => props.user, (newuser) => { data.value.user = newuser ? { ...newuser } : null })

function onHidden() {
  data.value.isSaving = false
  data.value.isEditing = false
}

function onEdit() {
  data.value.isEditing = true
}

function onSave() {
  const diff = compare(props.user, data.value.user)

  data.value.isSaving = true

  api.patch(`/api/v1/users/${encodeURI(props.user.username)}`, {
      patch: diff
  }).then(() => {
    emit('onSaved', data.value.user)

    toast.add({ severity: 'success', summary: 'Usuário', detail: 'Usuário atualizado com sucesso', life: 10000 });

    visible.value = false
  }).catch((error) => {
    data.value.isSaving = false
    toast.add({ severity: 'error', summary: 'Usuário', detail: 'Não foi possível atualizar o usuário.', life: 10000 });
  })

}
</script>

<template>
  <Dialog v-model:visible="visible" modal class="w-30rem" @hide="onHidden">
    <template #container="{ closeCallback }">
      <div class="user-card surface-ground border-round overflow-auto">
        <div class="relative h-10rem mb-6">
          <Image :src="data.user.cover" class="w-full"
            imageClass="cover w-full h-10rem cover border-round-top" :preview="!data.isEditing" />
          <Image :src="data.user.avatar" class="avatar mr-2 absolute top-100 left-50"
            :preview="!data.isEditing">
            <template #image="slotProps">
              <img :src="data.user.avatar" class="border-circle h-5rem border-3" />
              <Badge class="bottom-0 absolute -ml-3 p-2" :severity="data.user.active ? 'success' : 'danger'">
              </Badge>
            </template>
          </Image>
        </div>
        <div v-if="!data.isEditing" class="relative">
          <h2 class="text-center m-0" v-text="data.user.name"></h2>
          <small class="text-center block mt-0 text-color-secondary" v-text="data.user.email"></small>
        </div>
        <div v-else class="flex flex-column gap-2 px-4">
          <div class="flex flex-column gap-2 mb-2">
            <label>Nome</label>
            <InputText v-model="data.user.name" placeholder="Nome" />
          </div>
          <div class="flex flex-column gap-2 mb-2">
            <label>E-mail</label>
            <InputText v-model="data.user.email" placeholder="E-mail" />
          </div>
          <div class="flex flex-column gap-2 mb-2">
            <label>URL do Avatar</label>
            <InputText v-model="data.user.avatar" placeholder="Endereço do avatar" />
          </div>
          <div class="flex flex-column gap-2 mb-2">
            <label>URL da Capa</label>
            <InputText v-model="data.user.cover" placeholder="Endereço da capa" />
          </div>
          <div class="flex align-items-center justify-content-end gap-2">
            <label for="switchAtivo">Ativo</label>
            <InputSwitch id="switchAtivo" v-model="data.user.active" aria-describedby="text-error" />
          </div>
        </div>
        <footer class="flex justify-content-center p-4 mt-4">
          <Button v-if="data.isEditing" :loading="data.isSaving" icon="pi pi-ban" class="mx-3" outlined severity="secondary"
            label="Cancelar" size="small" @click="closeCallback" />
          <Button v-else icon="pi pi-reply rotate-180" class="mx-3" outlined severity="secondary" label="Voltar"
            size="small" @click="closeCallback" />

          <Button v-if="data.isEditing" :loading="data.isSaving" icon="pi pi-save"
            severity="success" label="Salvar" size="small" @click="onSave" />
          <Button v-else icon="pi pi-pencil" severity="info" label="Editar" size="small" @click="onEdit" />
        </footer>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.user-card {
  :deep(.cover) {
    object-fit: cover;
  }
  :deep(.avatar) {
    transform: translate(-50%, -50%);

    .p-image-preview-indicator {
      border-radius: 50% !important;
    }
  }
}
</style>