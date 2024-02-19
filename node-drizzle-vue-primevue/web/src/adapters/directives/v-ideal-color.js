function pickIdealColor(bgColor, lightColor = '#FFFFFF', darkColor = '#000000') {
  const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ? darkColor : lightColor;
}

function setColor(el, binding) {
  const lightColor = '#FFFFFF'
  const darkColor = '#000000'
  
  if(!binding.value?.trim().length) {
    return
  }

  el.style[binding.arg ?? 'color'] = binding.modifiers.invert 
    ? pickIdealColor(binding.value, darkColor, lightColor) 
    : pickIdealColor(binding.value, lightColor, darkColor)
}

const vIdealColor = {
  mounted(el, binding) {
    setColor(el, binding)
  },
  updated(el, binding) {
    setColor(el, binding)
  },
}

export default vIdealColor