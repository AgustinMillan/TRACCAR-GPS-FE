import { getApiUrl, API_CONFIG } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.MOTOR_BIKES)

/**
 * Obtiene todas las motos
 * @returns {Promise<Array>} Lista de motos
 */
export const getAllMotorBikes = async () => {
    try {
        const response = await fetch(API_BASE_URL)
        if (!response.ok) {
            throw new Error(`Error al obtener las motos: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
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
        const response = await fetch(`${API_BASE_URL}/${id}`)
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
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
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

