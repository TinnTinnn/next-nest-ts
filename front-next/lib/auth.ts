// File for managing authentication and tokens
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  sub: string
  username: string
  exp: number
  iat: number
}

// Function to get tokens from localStorage (client-side only)
export const getTokens = () => {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null }

  // Save access_token and refresh_token to localstorage
  const accessToken = localStorage.getItem("access_token")
  const refreshToken = localStorage.getItem("refresh_token")

  return { accessToken, refreshToken }
}

// Function to check if token is expired
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    return decoded.exp < currentTime
  } catch (error) {
    console.error("Error decoding token:", error)
    return true
  }
}

// Function to refresh token
export const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = getTokens()

  if (!refreshToken || isTokenExpired(refreshToken)) {
    // If refresh token is expired or doesn't exist, logout
    logout()
    return null
  }

  try {
    const response = await fetch("http://localhost:3001/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      credentials: "include", // add credentials: 'include' for send cookies
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const data = await response.json()
    localStorage.setItem("access_token", data.access_token) 

    // เก็บ refresh_token ด้วยถ้า API ส่งกลับมา
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token)
    }

    return data.access_token 
  } catch (error) {
    console.error("Error refreshing token:", error)
    logout()
    return null
  }
}

// Function for logout
export const logout = () => {
  if (typeof window === "undefined") return

  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")

   // หน่วงเวลา 3 วิ ก่อน redirect
  setTimeout(() => {
    window.location.href = "/";
  }, 3000); // 3 วินาที
}

// Function to call API that requires authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let { accessToken } = getTokens()

  // Check if token is expired
  if (isTokenExpired(accessToken)) {
    // If expired, refresh token
    accessToken = await refreshAccessToken()

    if (!accessToken) {
      throw new Error("Authentication required")
    }
  }

  // Add Authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  }

  // Send request with token
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // เพิ่ม credentials: 'include' เพื่อส่ง cookies
  })

  // If response is 401 (Unauthorized), try to refresh token and send request again
  if (response.status === 401) {
    accessToken = await refreshAccessToken()

    if (!accessToken) {
      throw new Error("Authentication required")
    }

    // Send request again with new token
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include", // เพิ่ม credentials: 'include' เพื่อส่ง cookies
    })
  }

  return response
}
