import { getApiUrl, API_CONFIG } from '../config/api'

const POSITIONS_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.TRACCAR_POSITIONS)

/**
 * Obtiene la posición actual de una moto
 * @param {number} motorBikeId - ID de la moto
 * @returns {Promise<Object>} Posición de la moto { latitude, longitude, speed }
 */
export const getMotorBikePosition = async (motorBikeId) => {
    try {
        const response = await fetch(`${POSITIONS_BASE_URL}/${motorBikeId}`)
        if (!response.ok) {
            throw new Error(`Error al obtener la posición: ${response.statusText}`)
        }
        const data = await response.json()
        if (data.success && data.data) {
            return {
                latitude: parseFloat(data.data.latitude),
                longitude: parseFloat(data.data.longitude),
                speed: parseFloat(data.data.speed) || 0,
            }
        }
        throw new Error('No se pudo obtener la posición de la moto')
    } catch (error) {
        console.error('Error en getMotorBikePosition:', error)
        throw error
    }
}

/**
 * Obtiene las posiciones de múltiples motos
 * @param {Array<number>} motorBikeIds - Array de IDs de motos
 * @returns {Promise<Array>} Array de posiciones con el ID de la moto
 */
export const getMultipleMotorBikePositions = async (motorBikeIds) => {
    try {
        const positionsPromises = motorBikeIds.map(async (id) => {
            try {
                const position = await getMotorBikePosition(id)
                return { id, ...position }
            } catch (error) {
                console.error(`Error al obtener posición de moto ${id}:`, error)
                return null
            }
        })

        const positions = await Promise.all(positionsPromises)
        return positions.filter((pos) => pos !== null)
    } catch (error) {
        console.error('Error en getMultipleMotorBikePositions:', error)
        throw error
    }
}

