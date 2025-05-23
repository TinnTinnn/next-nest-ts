'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Box, KeyRound } from 'lucide-react';
import { error } from 'next/dist/build/output/log';
import { useUser } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const { user } = useUser()
  const router = useRouter();
  const { setUser, reFetchUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  // Check is  token already have?
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      router.push("/dashboard")
    }
  }, [router])


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed.');
      }

      const data = await response.json();
      console.log('Login success:', data);

      //   save access_token (optional: localStorage)
      localStorage.setItem('access_token', data.access_token);

      // เก็บ refresh_token ด้วยถ้ามี
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }

      // แสดงข้อความแจ้งเตือน
      toast({
        title: "Login Successful",
        description: "Welcome back to the system",
        variant: "success"
      })

      // ดึง /auth/me มาใส่ context ทันที
      const meRes = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.access_token}`,
          "Content-type": "application/json",
        },
        credentials: 'include',
      });

      if (!meRes.ok) throw new Error('Failed to fetch user');

      const me = await meRes.json();
      setUser(me);

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your email and password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  },[user, isLoading])

  if (isLoading) return null

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-muted/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Inventory Management System</CardTitle>
          <CardDescription className="text-center">Please sign in to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="your@email.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-primary/20" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="p-0 h-auto text-xs">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/20" />
            </div>
            <Button type="submit" className="w-full">
              <KeyRound className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
