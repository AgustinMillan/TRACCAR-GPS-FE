import { getApiUrl, API_CONFIG } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.AUTH)

/**
 * Inicia sesión de usuario
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} Datos del usuario y token
 */
export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || `Error al iniciar sesión: ${response.statusText}`)
        }
        return data
    } catch (error) {
        console.error('Error en loginUser:', error)
        throw error
    }
}

/**
 * Registra al primer administrador
 * @param {string} initialAdminKey 
 * @param {Object} user 
 * @returns {Promise<Object>} Datos del admin creado
 */
export const registerFirstAdmin = async (initialAdminKey, user) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register-first-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initialAdminKey, user }),
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || `Error al registrar administrador: ${response.statusText}`)
        }
        return data.data
    } catch (error) {
        console.error('Error en registerFirstAdmin:', error)
        throw error
    }
}
