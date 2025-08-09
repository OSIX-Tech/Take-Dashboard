// Validation utilities for form inputs

export const validatePrice = (price) => {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) {
    return { isValid: false, error: 'El precio debe ser un número válido' }
  }
  if (numPrice < 0) {
    return { isValid: false, error: 'El precio no puede ser negativo' }
  }
  if (numPrice > 9999) {
    return { isValid: false, error: 'El precio no puede ser mayor a 9999' }
  }
  // Round to 2 decimal places
  const roundedPrice = Math.round(numPrice * 100) / 100
  return { isValid: true, value: roundedPrice }
}

export const validateDate = (dateString) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Fecha inválida' }
  }
  
  // Check if date is not too far in the past (e.g., more than 1 year)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  if (date < oneYearAgo) {
    return { isValid: false, error: 'La fecha no puede ser más antigua de un año' }
  }
  
  // Check if date is not too far in the future (e.g., more than 2 years)
  const twoYearsFromNow = new Date()
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
  if (date > twoYearsFromNow) {
    return { isValid: false, error: 'La fecha no puede ser más de 2 años en el futuro' }
  }
  
  return { isValid: true, value: date.toISOString() }
}

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} es requerido` }
  }
  return { isValid: true, value: value.toString().trim() }
}

export const validateImageUrl = (url) => {
  if (!url) return { isValid: true, value: '' } // Optional field
  
  try {
    new URL(url)
    // Check if it's an image URL (basic check)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
    
    if (!hasImageExtension && !url.includes('cloudinary') && !url.includes('imgur')) {
      return { isValid: false, error: 'La URL debe apuntar a una imagen válida' }
    }
    
    return { isValid: true, value: url }
  } catch {
    return { isValid: false, error: 'URL inválida' }
  }
}