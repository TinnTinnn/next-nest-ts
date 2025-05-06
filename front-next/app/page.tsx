"use client"

import React, { useState } from 'react';

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Box, KeyRound } from "lucide-react"
import { error } from 'next/dist/build/output/log';

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed.")
      }

      const data = await response.json()
      console.log("Login success:", data);

    //   save access_token (optional: localStorage)
      localStorage.setItem("access_token", data.accesss_token)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your email and password")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
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
  )
}
