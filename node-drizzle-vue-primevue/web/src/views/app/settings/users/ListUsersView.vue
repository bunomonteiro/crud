<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from "primevue/usetoast";
import { FilterMatchMode, FilterOperator } from 'primevue/api'

import { useApi } from '@/services/network/http.service'
import UserEditor from '@/components/users/UserEditor.vue'

const api = useApi()
const toast = useToast()

const users = ref()
const isFetching = ref(false)
const editionInfo = ref({
  user: null,
  visible: false,
  isEditing: false,
  isSaving: false
})

const params = ref({
  pagination: {
    page: 0,
    size: 10,
    total: 0
  },
  sorting: [],
  filters: {
    'id': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'email': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'username': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'otpEnabled': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'active': { value: null, matchMode: FilterMatchMode.EQUALS },
  }
})

function fetchData() {
  isFetching.value = true
  api.get("/api/v1/users", {
    params: {
      page: params.value.pagination.page,
      size: params.value.pagination.size,
      sorting: params.value.sorting,
      filters: params.value.filters
    }
  }).then(({ data }) => {
    params.value.pagination.page = data.currentPage
    params.value.pagination.size = data.pageSize
    params.value.pagination.total = data.totalRows

    users.value = data.users

    isFetching.value = false
  }).catch((error) => {
    isFetching.value = false
    toast.add({ severity: 'error', summary: 'Usuários', detail: 'Não foi possível consultar os usuários.', life: 10000 });
  })
}

function onChangePage(event) {
  if (event) {
    if (event.page == params.value.pagination.page && event.rows == params.value.pagination.size) {
      return false
    }
    params.value.pagination.page = event.page;
    params.value.pagination.size = event.rows;
  }

  fetchData()
}

function onSort(event) {
  params.value.sorting = event.multiSortMeta

  fetchData()
}

function onFilter(event) {
  params.value.pagination.page = 0
  params.value.filters = event.filters

  fetchData()
}

function onUserSaved(user) {
  fetchData()
}

function displayUserCard(user) {
  editionInfo.value.visible = true
  editionInfo.value.user = user
}

function changeUserStatus(user) {
  const patch = [{
    "op": "replace",
    "path": "/active",
    "value": !user.active
  }]
  
  isFetching.value = true

  api.patch(`/api/v1/users/${encodeURI(user.username)}`, {
      patch: patch
  }).then(() => {
    toast.add({ severity: 'success', summary: 'Usuário', detail: 'Usuário atualizado com sucesso', life: 10000 })

    fetchData()
  }).catch((error) => {
    isFetching.value = false
    toast.add({ severity: 'error', summary: 'Usuário', detail: 'Não foi possível atualizar a situação do usuário.', life: 10000 })
  })
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page p-4">
    <h2>Usuários</h2>
    
    <br>

    <DataTable :value="users" :loading="isFetching" lazy dataKey="id" tableClass="border-round-md" sortMode="multiple"
      removable-sort :totalRecords="params.pagination.total" paginator :rows="params.pagination.size"
      :rows-per-page-options="[10, 25, 50]" v-model:filters="params.filters" filterDisplay="menu" 
      @sort="onSort" @filter="onFilter" @page="onChangePage">
      <template #empty> Nenhum registro encontrado. </template>
      <Column field="id" header="Id" hidden></Column>
      <Column header="Nome" sortable sortField="name" filterField="name">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Busque pelo nome" />
        </template>
        <template #body="slotProps">
          <div class="flex align-items-center">
            <Avatar :image="slotProps.data.avatar" class="mr-2" size="large" shape="circle" />
            <span class="capitalize font-semibold overflow-hidden max-w-15rem text-overflow-ellipsis" v-text="slotProps.data.name"></span>
          </div>
        </template>
      </Column>
      <Column field="email" header="Email" sortable sortField="email" filterField="email">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Busque pelo e-mail" />
        </template>
      </Column>
      <Column field="username" header="Nome de usuário" sortable sortField="username" filterField="username">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Busque pelo login" />
        </template>
      </Column>
      <Column field="active" dataType="boolean" header="Ativo" sortable sortField="active" filterField="active">
        <template #filter="{ filterModel }">
          <div class="flex gap-2 align-items-center w-12rem justify-content-center">
            <label for="active-filter" class="font-bold">Ativo</label>
            <TriStateCheckbox v-model="filterModel.value" :binary="true" inputId="active-filter" />
          </div>
        </template>
        <template #body="slotProps">
          <div>
            <i class="pi" :class="{ 'pi-check-circle text-green-500 ': slotProps.data.active, 'pi-times-circle text-red-500': !slotProps.data.active }"></i>
          </div>
        </template>
      </Column>
      <Column class="w-3rem">
        <template #body="slotProps">
          <div class="flex align-items-center">
            <Button icon="pi pi-eye" class="hover:text-cyan-400" severity="secondary" text rounded aria-label="Ver" @click="displayUserCard(slotProps.data)" />
            <Button v-if="slotProps.data.active" icon="pi pi-times" class="hover:text-red-400" severity="secondary" text rounded aria-label="Desativar" @click="changeUserStatus(slotProps.data)" />
            <Button v-else icon="pi pi-check" class="hover:text-green-400" severity="secondary" text rounded aria-label="Ativar" @click="changeUserStatus(slotProps.data)" />
          </div>
        </template>
      </Column>
      <template #footer>
        <div class="text-right text-color-secondary font-normal">
          <small>{{ params.pagination.total }} registros</small>
        </div>
      </template>
    </DataTable>

    <UserEditor v-model:visible="editionInfo.visible" :user="editionInfo.user" @onSaved="onUserSaved"></UserEditor>
  </div>
</template>