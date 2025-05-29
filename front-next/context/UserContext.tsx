"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';


type User = {
  id: number
  name: string
  email: string
  role: string
} | null

type UserContext = {
  user: User
  setUser: (user: User) => void
  logout: () => void
}

const UserContext = createContext<UserContext | undefined> (undefined)

export const UserProvider = ({ children } :{ children : React.ReactNode }) => {
  const [user, setUser] = useState<User>(null)

  // เมื่อโหลดแอพครั้งแรก ดึง user จาก backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/auth/me', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.log('No user or error fetching /auth/me')
      }
    }

    fetchUser()
  }, [])

  const logout = async () => {
    await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
  }
  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used inside UserProvider')
  }
  return context
}