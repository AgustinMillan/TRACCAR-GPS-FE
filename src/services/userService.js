import { getApiUrl, API_CONFIG, getAuthHeaders, fetchWithAuth } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.USERS)

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getAllUsers = async () => {
    try {
        const response = await fetchWithAuth(API_BASE_URL, {
            headers: getAuthHeaders()
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || `Error al obtener usuarios: ${response.statusText}`)
        }
        return data.data
    } catch (error) {
        console.error('Error en getAllUsers:', error)
        throw error
    }
}

/**
 * Obtiene un usuario por ID
 * @param {number} id 
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserById = async (id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
            headers: getAuthHeaders()
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || `Error al obtener el usuario: ${response.statusText}`)
        }
        return data.data
    } catch (error) {
        console.error('Error en getUserById:', error)
        throw error
    }
}

/**
 * Crea un nuevo usuario
 * @param {Object} userData 
 * @returns {Promise<Object>} Usuario creado
 */
export const createUser = async (userData) => {
    try {
        const response = await fetchWithAuth(API_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || `Error al crear usuario: ${response.statusText}`)
        }
        return data.data
    } catch (error) {
        console.error('Error en createUser:', error)
        throw error
    }
}

/**
 * Actualiza un usuario
 * @param {number} id 
 * @param {Object} userData 
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUser = async (id, userData) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || `Error al actualizar usuario: ${response.statusText}`)
        }
        return data.data
    } catch (error) {
        console.error('Error en updateUser:', error)
        throw error
    }
}
