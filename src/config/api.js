// Configuración de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  ENDPOINTS: {
    MOTOR_BIKES: '/api/motor-bikes',
    MOTOR_BIKE_DEBTS: '/api/motor-bikes/reports/debts',
    TRACCAR_POSITIONS: '/api/traccar/get-positions',
    MOTOR_BIKE_DAYS: '/api/motor-bike-days',
    CLIENTS: '/api/clients',
    FILES: '/api/files',
    AUTH: '/api/auth',
    USERS: '/api/users',
  },
}

// Helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('token')
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

/**
 * Wrapper de fetch que detecta respuestas 401 (token vencido/inválido).
 * Limpia la sesión del localStorage y redirige al login automáticamente.
 * Úsalo como reemplazo directo de fetch() en los servicios autenticados.
 */
export const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, options)

  // El backend devuelve 401 si no hay token y 403 si el token expiró/es inválido
  if (response.status === 401 || response.status === 403) {
    // Limpiar sesión
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redirigir al login (compatible sin React Router)
    window.location.href = '/login'
    // Lanzar error para que el caller corte la ejecución
    throw new Error('Sesión expirada. Redirigiendo al login...')
  }

  return response
}
