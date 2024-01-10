<script setup>
import { ref, onBeforeMount } from 'vue'

// SEE: https://vuejs.org/guide/components/v-model.html
const props = defineProps({ modelValue: { type: String } })
const emit = defineEmits(['update:modelValue'])

const number1 = ref(null)
const number2 = ref(null)
const number3 = ref(null)
const number4 = ref(null)
const number5 = ref(null)
const number6 = ref(null)

const numbers = [number1, number2, number3, number4, number5, number6]

function getCode() {
  const code = [
    number1.value || '0',
    number2.value || '0',
    number3.value || '0',
    number4.value || '0',
    number5.value || '0',
    number6.value || '0'
  ].join('')

  return code === '000000' ? null : code
}

const updateValue = () => emit('update:modelValue', getCode())

function bindCode(code) {
  if(isNaN(code) || !(code||'').trim().length || code.toString().length != 6) {
    return false
  }

  number1.value = code[0]
  number2.value = code[1]
  number3.value = code[2]
  number4.value = code[3]
  number5.value = code[4]
  number6.value = code[5]

  return true
}

onBeforeMount(() => {
  if(props.modelValue?.length === 6) {
    bindCode(props.modelValue)
  }
})

function onPaste(event) {
  event.preventDefault();
  const code = (event.clipboardData || window.clipboardData).getData("text")  
  if(bindCode(code)) {
    updateValue()
  }
}

function onInput(number, event) {
  const targetNumber = numbers[number-1]
  
  if (isNaN((event.data || '').trim()) || (event.data || '').trim().length === 0) {
    targetNumber.value = null
    updateValue()
    return;
  } else {
    targetNumber.value = event.data
  }

  updateValue()

  if(event.target.nextElementSibling) {
    event.target.nextElementSibling.focus()
  }
}

function onKeyup(number, event) {
  const targetNumber = numbers[number-1]
  if (event.key.toLowerCase() == "backspace") {
    targetNumber.value = null;
    updateValue()

    if(event.target.previousElementSibling) {
      event.target.previousElementSibling.focus()
    }
    return;
  }

  if(event.key.toLowerCase() == "delete") {
    targetNumber.value = null;
    updateValue()

    if(event.target.nextElementSibling) {
      event.target.nextElementSibling.focus()
    }
    return;
  }

  if(event.key.toLowerCase() == "arrowright" && event.target.nextElementSibling) {
    event.target.nextElementSibling.focus()
    return;
  }

  if(event.key.toLowerCase() == "arrowleft" && event.target.previousElementSibling) {
    event.target.previousElementSibling.focus()
    return;
  }
}
</script>

<template>
  <div class="w-full flex flex-wrap align-content-center justify-content-between">
    <input v-model="number1" class="otp-number text-center inline-block p-inputtext p-component p-inputnumber-input font-bold" @input="onInput(1, $event)" @keyup="onKeyup(1, $event)" @paste="onPaste" />
    <input v-model="number2" class="otp-number text-center inline-block p-inputtext p-component p-inputnumber-input font-bold" @input="onInput(2, $event)" @keyup="onKeyup(2, $event)" @paste="onPaste" />
    <input v-model="number3" class="otp-number text-center inline-block p-inputtext p-component p-inputnumber-input font-bold" @input="onInput(3, $event)" @keyup="onKeyup(3, $event)" @paste="onPaste" />
    <input v-model="number4" class="otp-number text-center inline-block p-inputtext p-component p-inputnumber-input font-bold" @input="onInput(4, $event)" @keyup="onKeyup(4, $event)" @paste="onPaste" />
    <input v-model="number5" class="otp-number text-center inline-block p-inputtext p-component p-inputnumber-input font-bold" @input="onInput(5, $event)" @keyup="onKeyup(5, $event)" @paste="onPaste" />
    <input v-model="number6" class="otp-number text-center inline-block p-inputtext p-component p-inputnumber-input font-bold" @input="onInput(6, $event)" @keyup="onKeyup(6, $event)" @paste="onPaste" />
  </div>
</template>

<style lang="scss" scoped>
.otp-number {
  width: 35px;
}
</style>