// Configuración de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  ENDPOINTS: {
    MOTOR_BIKES: '/api/motor-bikes',
    TRACCAR_POSITIONS: '/api/traccar/get-positions',
  },
}

// Helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

