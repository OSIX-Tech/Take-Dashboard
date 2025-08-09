// Centralized error messages for consistency across the application

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas. Por favor, verifica tu email y contraseña.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    NOT_AUTHENTICATED: 'Debes iniciar sesión para acceder a esta sección.',
    ADMIN_ONLY: 'Esta acción requiere permisos de administrador.',
    LOGIN_FAILED: 'Error al iniciar sesión. Por favor, intenta nuevamente.',
    LOGOUT_FAILED: 'Error al cerrar sesión. Por favor, intenta nuevamente.',
  },
  
  // Network errors
  NETWORK: {
    CONNECTION_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
    TIMEOUT: 'La solicitud tardó demasiado. Por favor, intenta nuevamente.',
    CORS_ERROR: 'Error de configuración CORS. Contacta al administrador.',
    API_UNAVAILABLE: 'El servicio no está disponible en este momento.',
  },
  
  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: (field) => `${field} es requerido.`,
    INVALID_EMAIL: 'El email ingresado no es válido.',
    INVALID_PRICE: 'El precio debe ser un número válido mayor o igual a 0.',
    INVALID_DATE: 'La fecha ingresada no es válida.',
    MIN_LENGTH: (field, min) => `${field} debe tener al menos ${min} caracteres.`,
    MAX_LENGTH: (field, max) => `${field} no puede tener más de ${max} caracteres.`,
    INVALID_IMAGE_URL: 'La URL de la imagen no es válida.',
    CATEGORY_REQUIRED: 'Debes seleccionar una categoría.',
  },
  
  // CRUD operations
  CRUD: {
    CREATE_FAILED: 'Error al crear el elemento. Por favor, intenta nuevamente.',
    UPDATE_FAILED: 'Error al actualizar el elemento. Por favor, intenta nuevamente.',
    DELETE_FAILED: 'Error al eliminar el elemento. Por favor, intenta nuevamente.',
    FETCH_FAILED: 'Error al cargar los datos. Por favor, recarga la página.',
    SAVE_SUCCESS: 'Los cambios se guardaron correctamente.',
    DELETE_SUCCESS: 'El elemento se eliminó correctamente.',
  },
  
  // File upload
  UPLOAD: {
    FILE_TOO_LARGE: 'El archivo es demasiado grande. El tamaño máximo es 5MB.',
    INVALID_FILE_TYPE: 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WebP).',
    UPLOAD_FAILED: 'Error al subir el archivo. Por favor, intenta nuevamente.',
  },
  
  // Generic errors
  GENERIC: {
    SOMETHING_WENT_WRONG: 'Algo salió mal. Por favor, intenta nuevamente.',
    TRY_AGAIN_LATER: 'Por favor, intenta más tarde.',
    CONTACT_SUPPORT: 'Si el problema persiste, contacta al soporte técnico.',
  }
}

// Helper function to get error message based on HTTP status code
export const getErrorMessageByStatus = (status) => {
  switch (status) {
    case 400:
      return 'Solicitud incorrecta. Verifica los datos ingresados.'
    case 401:
      return ERROR_MESSAGES.AUTH.UNAUTHORIZED
    case 403:
      return ERROR_MESSAGES.AUTH.ADMIN_ONLY
    case 404:
      return 'Recurso no encontrado.'
    case 409:
      return 'Conflicto con el estado actual del recurso.'
    case 422:
      return 'Los datos enviados no son válidos.'
    case 429:
      return 'Demasiadas solicitudes. Por favor, espera un momento.'
    case 500:
      return ERROR_MESSAGES.NETWORK.SERVER_ERROR
    case 502:
      return 'Error de gateway. El servidor no está respondiendo correctamente.'
    case 503:
      return ERROR_MESSAGES.NETWORK.API_UNAVAILABLE
    case 504:
      return ERROR_MESSAGES.NETWORK.TIMEOUT
    default:
      if (status >= 400 && status < 500) {
        return 'Error en la solicitud. Verifica los datos e intenta nuevamente.'
      } else if (status >= 500) {
        return ERROR_MESSAGES.NETWORK.SERVER_ERROR
      }
      return ERROR_MESSAGES.GENERIC.SOMETHING_WENT_WRONG
  }
}

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  // Network error (no response)
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK.CONNECTION_ERROR
  }
  
  // Get message from response if available
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  // Use status code to determine message
  if (error.response?.status) {
    return getErrorMessageByStatus(error.response.status)
  }
  
  // Default error
  return ERROR_MESSAGES.GENERIC.SOMETHING_WENT_WRONG
}

export default ERROR_MESSAGES