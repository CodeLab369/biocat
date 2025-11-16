const STORAGE_NAMESPACE = 'biocat-app'

export const storageService = {
  getSnapshot: () => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = window.localStorage.getItem(STORAGE_NAMESPACE)
      return raw ? JSON.parse(raw) : {}
    } catch (error) {
      console.error('Error leyendo localStorage', error)
      return {}
    }
  },
  saveSnapshot: (data) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(data))
  },
  clear: () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_NAMESPACE)
  },
}
