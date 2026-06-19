import { getApiUrl, API_CONFIG, getAuthHeaders, fetchWithAuth } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.MOTOR_BIKES)

/**
 * Obtiene todas las motos
 * @returns {Promise<Array>} Lista de motos
 */
export const getAllMotorBikes = async () => {
    try {
        const response = await fetchWithAuth(API_BASE_URL, { headers: getAuthHeaders() })
        if (!response.ok) {
            throw new Error(`Error al obtener las motos: ${response.statusText}`)
        }
        const data = await response.json()
        const mappedData = data.data.map(bike => {
            let displayName = bike.name
            if (bike.client && bike.client.name) {
                const ownerFirstName = bike.client.name.split(' ')[0]
                displayName = `${bike.name} (${ownerFirstName})`
            }
            return {
                ...bike,
                originalName: bike.name,
                displayName
            }
        })
        return mappedData
    } catch (error) {
        console.error('Error en getAllMotorBikes:', error)
        throw error
    }
}

/**
 * Obtiene una moto por ID
 * @param {number} id - ID de la moto
 * @returns {Promise<Object>} Datos de la moto
 */
export const getMotorBikeById = async (id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() })
        if (!response.ok) {
            throw new Error(`Error al obtener la moto: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en getMotorBikeById:', error)
        throw error
    }
}

/**
 * Crea una nueva moto
 * @param {Object} motorBikeData - Datos de la moto { name, trackingToken, isActive }
 * @returns {Promise<Object>} Moto creada
 */
export const createMotorBike = async (motorBikeData) => {
    try {
        const response = await fetchWithAuth(API_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(motorBikeData),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Error al crear la moto: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en createMotorBike:', error)
        throw error
    }
}

/**
 * Actualiza una moto existente
 * @param {number} id - ID de la moto
 * @param {Object} motorBikeData - Datos actualizados de la moto
 * @returns {Promise<Object>} Moto actualizada
 */
export const updateMotorBike = async (id, motorBikeData) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(motorBikeData),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Error al actualizar la moto: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en updateMotorBike:', error)
        throw error
    }
}

/**
 * Obtiene el reporte de deudas de las motos
 * @returns {Promise<Object>} Object containing data (array) and count
 */
export const getMotorBikeDebts = async () => {
    try {
        const response = await fetchWithAuth(getApiUrl(API_CONFIG.ENDPOINTS.MOTOR_BIKE_DEBTS), { headers: getAuthHeaders() })
        if (!response.ok) {
            throw new Error(`Error al obtener reporte de deudas: ${response.statusText}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error en getMotorBikeDebts:', error)
        throw error
    }
}
