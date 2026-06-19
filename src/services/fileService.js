import { getApiUrl, API_CONFIG, getAuthHeaders, getAuthHeadersMultipart, fetchWithAuth } from '../config/api'

const API_BASE_URL = getApiUrl(API_CONFIG.ENDPOINTS.FILES)

/**
 * Sube un archivo al servidor
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} Objeto con los datos del archivo, incluyendo 'url'
 */
export const uploadFile = async (file) => {
    try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetchWithAuth(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: getAuthHeadersMultipart(),
            body: formData, // Fetch automatically sets the multipart/form-data boundary
        })
        
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Error al subir el archivo: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en uploadFile:', error)
        throw error
    }
}

/**
 * Obtiene todos los archivos
 * @returns {Promise<Array>} Lista de archivos
 */
export const getAllFiles = async () => {
    try {
        const response = await fetchWithAuth(API_BASE_URL, {
            headers: getAuthHeaders()
        })
        if (!response.ok) {
            throw new Error(`Error al obtener los archivos: ${response.statusText}`)
        }
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error en getAllFiles:', error)
        throw error
    }
}

/**
 * Elimina un archivo
 * @param {number} id - ID del archivo
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Error al eliminar el archivo: ${response.statusText}`)
        }
        return true
    } catch (error) {
        console.error('Error en deleteFile:', error)
        throw error
    }
}
