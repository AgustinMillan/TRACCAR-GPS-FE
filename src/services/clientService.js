import { getApiUrl, API_CONFIG, getAuthHeaders } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.CLIENTS)

/**
 * Obtiene todos los clientes
 * @returns {Promise<Array>} Lista de clientes
 */
export const getAllClients = async () => {
    try {
        const response = await fetch(API_BASE_URL, {
            headers: getAuthHeaders()
        })
        if (!response.ok) {
            throw new Error(`Error al obtener los clientes: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en getAllClients:', error)
        throw error
    }
}

/**
 * Obtiene un cliente por ID
 * @param {number} id - ID del cliente
 * @returns {Promise<Object>} Datos del cliente
 */
export const getClientById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            headers: getAuthHeaders()
        })
        if (!response.ok) {
            throw new Error(`Error al obtener el cliente: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en getClientById:', error)
        throw error
    }
}

/**
 * Crea un nuevo cliente
 * @param {Object} clientData - Datos del cliente
 * @returns {Promise<Object>} Cliente creado
 */
export const createClient = async (clientData) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(clientData),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Error al crear el cliente: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en createClient:', error)
        throw error
    }
}

/**
 * Actualiza un cliente existente
 * @param {number} id - ID del cliente
 * @param {Object} clientData - Datos actualizados del cliente
 * @returns {Promise<Object>} Cliente actualizado
 */
export const updateClient = async (id, clientData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(clientData),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Error al actualizar el cliente: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en updateClient:', error)
        throw error
    }
}
