function onClickOutside(event, el, handler) {
  const isClickOutside = event.target !== el && !el.contains(event.target);

  return isClickOutside ? handler(event, el) : null;
}

const vClickOutside = {
  beforeMount(el, binding) {
    el.onClickOutside = onClickOutside;

    document.addEventListener('click', (event) => el.onClickOutside(event, el, binding.value))
  },
  unmounted(el, binding) {
    document.removeEventListener('click', el.onClickOutside);
  },
}

export default vClickOutside