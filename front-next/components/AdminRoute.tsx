"use client"

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRoute({ children } : { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/')  // ไม่ login เตะ กลับไป login
      } else if (user.role !== 'admin') {
        router.push('/unauthorized') // ไม่ใช่ admin เตะไปหน้า ห้ามเข้า
      }
    }
  }, [isLoading, user])

  if (isLoading || !user || user.role !== 'admin') {
    return null  // loading หรือยังไม่ผ่าน จะไม่ render
}
  return <>{children}</>
}