import { getApiUrl, API_CONFIG } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.MOTOR_BIKE_DAYS)

/**
 * Crea un nuevo registro de día en el calendario de la moto
 * @param {Object} data - { date, status, debt, motorBikeId }
 * @returns {Promise<Object>} Registro creado
 */
export const createMotorBikeDay = async (data) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        const result = await response.json()
        if (!response.ok || !result.success) {
            throw new Error(result.error || `Error al crear: ${response.statusText}`)
        }
        return result.data
    } catch (error) {
        console.error('Error en createMotorBikeDay:', error)
        throw error
    }
}

/**
 * Obtiene el calendario mensual de una moto
 * @param {number} motorBikeId - ID de la moto
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {Promise<Array>} Lista de registros del mes
 */
export const getMotorBikeDays = async (motorBikeId, year, month) => {
    try {
        const url = `${API_BASE_URL}/${motorBikeId}?year=${year}&month=${month}`
        const response = await fetch(url)
        const result = await response.json()
        if (!response.ok || !result.success) {
            throw new Error(result.error || `Error al obtener calendario: ${response.statusText}`)
        }
        return result.data
    } catch (error) {
        console.error('Error en getMotorBikeDays:', error)
        throw error
    }
}

/**
 * Actualiza un registro existente (Modificar día)
 * @param {number} id - ID del registro
 * @param {Object} data - Datos a actualizar { status, debt }
 * @returns {Promise<Object>} Registro actualizado
 */
export const updateMotorBikeDay = async (id, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        const result = await response.json()
        if (!response.ok || !result.success) {
            throw new Error(result.error || `Error al actualizar: ${response.statusText}`)
        }
        return result.data
    } catch (error) {
        console.error('Error en updateMotorBikeDay:', error)
        throw error
    }
}
