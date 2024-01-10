<script setup>
import { ref, onMounted, inject } from 'vue'
import { useToast } from "primevue/usetoast";
import { FilterMatchMode, FilterOperator } from 'primevue/api'

import { useApi } from '@/services/network/http.service'

const isFetching = ref(false)
const dayjs = inject('dayjs')
const api = useApi()
const toast = useToast()
const tableParams = ref({
  pagination: {
    page: 0,
    size: 10,
    total: 0
  },
  sorting: [{field: 'createdAt', order: -1}],
  filters: {
    // ------------------
    // Filtros tipo ROW
    // Deve-se alterar a propriedade filterDisplay do Datatable para 'row'
    // ------------------
    // 'user.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    // 'event': { value: null, matchMode: FilterMatchMode.EQUALS },
    // 'operator.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    // 'createdAt': { value: null, matchMode: FilterMatchMode.DATE_IS },
    // ------------------
    // Filtros tipo MENU
    // Deve-se alterar a propriedade filterDisplay do Datatable para 'menu'
    // ------------------
    'user.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'event': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'operator.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    'createdAt': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  }
})

const histories = ref()
const events = {
  "user.created": { label: "criado", color: "bg-green-600" },
  "user.signed_up": { label: "Auto cadastrado", color: "bg-green-600" },
  "user.updated": { label: "atualizado", color: "bg-blue-600" },
  "user.password_recovery_requested": { label: "solicitou recuperação de senha", color: "bg-red-600" },
  "user.password_changed": { label: "atualizou a senha", color: "bg-red-600" },
  "user.logged_in": { label: "acessou o sistema", color: "bg-gray-600" },
  "user.logged_in_with_otp": { label: "acessou o sistema com 2FA", color: "bg-gray-600" },
  "user.logged_out": { label: "saiu do sistema", color: "bg-gray-600" },
  "user.otp_registered": { label: "registrou 2FA", color: "text-color-secondary bg-teal-600" },
  "user.requested_otp_uri": { label: "solicitou validação do 2FA", color: "bg-teal-600" },
  "user.otp_verified": { label: "validou o 2FA", color: "bg-teal-600" },
  "user.otp_disabled": { label: "desabilitou o 2FA", color: "bg-red-600" },
}

function fetchData() {
  isFetching.value = true
  api.get("/api/v1/user-histories", { 
      params: { 
        page: tableParams.value.pagination.page, 
        size: tableParams.value.pagination.size,
        sorting: tableParams.value.sorting,
        filters: tableParams.value.filters
      }
    }).then(({data}) => {
    tableParams.value.pagination.page = data.currentPage
    tableParams.value.pagination.size = data.pageSize
    tableParams.value.pagination.total = data.totalRows
    
    histories.value = data.userHistories.map(history => ({
      ...history,
      user: {...history.user, avatar: history.user.avatar ?? '/public/images/unknown user_avatar.png' },
      operator: {...history.operator, avatar: history.operator.avatar ?? '/public/images/unknown user_avatar.png' },
      formatedCreatedAt: dayjs(history.createdAt).format('DD/MM/YYYY HH:mm:ss')
    }))

    isFetching.value = false
  }).catch((error) => {
    isFetching.value = false
    toast.add({ severity: 'error', summary: 'Histórico dos Usuários', detail: 'Não foi possível consultar os históricos.', life: 10000 });
  })
}

function onChangePage(event) {
  if(event) {
    if(event.page == tableParams.value.pagination.page && event.rows == tableParams.value.pagination.size) {
      return false
    }
    tableParams.value.pagination.page = event.page;
    tableParams.value.pagination.size = event.rows;
  }

  fetchData()
}

function onSort(event) {
  tableParams.value.sorting = event.multiSortMeta?.length
    ? event.multiSortMeta
    : [{field: 'createdAt', order: -1}]

  fetchData()
}

function onFilter(event) {
  tableParams.value.pagination.page = 0
  tableParams.value.filters = event.filters

  fetchData()
}

function getEvent(event) {
  return events[event] || 'Evento desconhecido'
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page p-4">
    <h2>Histórico dos usuários</h2>
    <br>
    <DataTable :value="histories" :loading="isFetching" lazy dataKey="id" tableClass="border-round-md" sortMode="multiple" removable-sort 
      :totalRecords="tableParams.pagination.total" paginator :rows="tableParams.pagination.size" :rows-per-page-options="[10, 25, 50]"
      v-model:filters="tableParams.filters" filterDisplay="menu"
      @sort="onSort" @filter="onFilter" @page="onChangePage">
      <template #empty> Nenhum registro encontrado. </template>
      <Column field="id" header="Id" hidden></Column>
      <Column header="Usuário" sortable sortField="user.name" filterField="user.name">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Busque pelo nome" />
        </template>
        <template #body="slotProps">
          <div class="flex align-items-center">
            <Avatar :image="slotProps.data.user.avatar" class="mr-2" size="large" shape="circle" />
            <span class="capitalize font-semibold overflow-hidden max-w-15rem text-overflow-ellipsis" v-text="slotProps.data.user.name"></span>
          </div>
        </template>
      </Column>
      <Column field="event" header="Evento" sortable sortField="event" filterField="event">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Busque pelo nome" />
        </template>
        <template #body="slotProps">
          <div class="px-2 py-1 border-round-md capitalize inline-block font-semibold" :class="getEvent(slotProps.data.event).color" v-text="slotProps.data.event"></div>
        </template>
      </Column> 
      <Column header="Operador" sortable sortField="operator.name" filterField="operator.name">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Busque pelo nome" />
        </template>
        <template #body="slotProps">
          <div class="flex align-items-center">
            <Avatar :image="slotProps.data.operator.avatar" class="mr-2" size="large" shape="circle" />
            <span class="capitalize font-semibold overflow-hidden max-w-15rem text-overflow-ellipsis" v-text="slotProps.data.operator.name"></span>
          </div>
        </template>
      </Column>
      <Column field="formatedCreatedAt" header="Data" sortable sortField="createdAt" filterField="createdAt" dataType="date">
        <template #filter="{ filterModel }">
          <Calendar v-model="filterModel.value" showTime hourFormat="24" dateFormat="dd/mm/yy" placeholder="__/__/____ __:__" mask="99/99/9999 99:99" />
        </template>
      </Column>
      <template #footer>
        <div class="text-right text-color-secondary font-normal">
          <small>{{ tableParams.pagination.total }} registros</small>
        </div>
      </template>
    </DataTable>
  </div>
</template>