import { ref } from 'vue'

export default function useRepository () {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  async function uploadRepository (payload, files = [], onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const form = new FormData()
      form.append('nombre', payload.nombre)
      form.append('descripcion', payload.descripcion)

      if (payload.pensumId !== undefined && payload.pensumId !== null && payload.pensumId !== '') {
        form.append('pensumId', String(payload.pensumId))
      }
      if (payload.cursoId !== undefined && payload.cursoId !== null && payload.cursoId !== '') {
        form.append('cursoId', String(payload.cursoId))
      }

      if (payload.tags && Array.isArray(payload.tags)) {
        payload.tags.forEach(t => form.append('tags[]', t))
      }
      if (payload.stacks && Array.isArray(payload.stacks)) {
        payload.stacks.forEach(s => form.append('stacks[]', s))
      }

      files.forEach(f => form.append('files', f))

      const xhr = new XMLHttpRequest()
      // Ensure we call the API with the global prefix '/api' used by the backend.
      const apiBase = baseUrl.replace(/\/$/, '')
      const endpoint = apiBase.includes('/api') ? `${apiBase}/repositories` : `${apiBase}/api/repositories`
      xhr.open('POST', endpoint, true)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText)
            resolve(json)
          } catch (e) {
            resolve(xhr.responseText)
          }
        } else {
          let backendMessage = ''
          try {
            const parsed = JSON.parse(xhr.responseText)
            backendMessage = parsed?.message || parsed?.error || ''
          } catch {
            backendMessage = ''
          }

          reject(
            new Error(
              backendMessage
                ? `HTTP ${xhr.status}: ${backendMessage}`
                : `HTTP ${xhr.status}: ${xhr.statusText}`,
            ),
          )
        }
      }
      xhr.onerror = () => reject(new Error('Error de red'))
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress(percent)
        }
      }

      // Attach auth token if present
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.send(form)
    })
  }

  return { uploadRepository }
}
