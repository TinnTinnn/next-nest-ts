"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  name?: string
  role?: string
}

type UserContextType = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  reFetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
  reFetchUser: async () => {},
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem("access_token")
    setUser(null)
    window.location.href = "/"
  }

  const fetchWithAutoRefresh = async (url: string, token: string) => {
    let res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    })

    if (res.status === 401) {
      const refreshRes = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (!refreshRes.ok) {
        throw new Error('Unable to refresh token')
      }

      const refreshData = await refreshRes.json()
      localStorage.setItem('access_token', refreshData.access_token)

      res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${refreshData.access_token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      })
    }

    return res
  }

  const fetchUser = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetchWithAutoRefresh('1/api/auth/me', token)
      if (!res.ok) throw new Error('Unauthorized')

      const data = await res.json()
      setUser(data)
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setUser(null)
      localStorage.removeItem("access_token") // ล้าง token ถ้า refresh ไม่ได้
    } finally {
      setIsLoading(false)
    }
  }

  const reFetchUser = async () => {
    setIsLoading(true)
    await fetchUser()
    setIsLoading(false)
  }

  useEffect(() => {
    reFetchUser()
  }, [router])

  return (
    <UserContext.Provider value={{ user, isLoading, setUser, logout, reFetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
