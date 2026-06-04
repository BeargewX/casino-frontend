import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      balance: 0,

      login: async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password })
        set({ user: data.user, token: data.token, balance: data.user.balance })
        return data
      },

      register: async (username, password) => {
        const { data } = await api.post('/auth/register', { username, password })
        set({ user: data.user, token: data.token, balance: data.user.balance })
        return data
      },

      logout: () => set({ user: null, token: null, balance: 0 }),

      refreshBalance: async () => {
        try {
          const { data } = await api.get('/wallet/balance')
          set({ balance: data.balance })
        } catch {}
      },

      setBalance: (balance) => set({ balance }),
    }),
    { name: 'casino-auth', partialize: (s) => ({ user: s.user, token: s.token, balance: s.balance }) }
  )
)
