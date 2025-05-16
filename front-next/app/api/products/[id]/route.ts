import { NextResponse } from "next/server"
import { getTokens, isTokenExpired, refreshAccessToken } from "@/lib/auth"

// Function to send request to Nest.js backend with token
async function sendToBackend(request: Request, id: string, method: string) {
  try {
    // Get data from request
    const body = method === "PATCH" ? await request.json() : null

    // For GET requests, we don't need authentication
    if (method === "GET") {
      // Send request to backend without token
      const backendUrl = `http://localhost:3001/api/products/${id}`
      const response = await fetch(backendUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Check response
      if (!response.ok) {
        const errorData = await response.json()
        return NextResponse.json(
          { success: false, message: errorData.message || `Failed to retrieve product` },
          { status: response.status },
        )
      }

      // Send response back to client
      const data = await response.json()
      return NextResponse.json(
        {
          success: true,
          message: "Product retrieved successfully",
          product: data,
        },
        { status: 200 },
      )
    }

    // For non-GET requests, we need authentication
    // Get token from localStorage
    let { accessToken } = getTokens()

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      // If expired, refresh token
      accessToken = await refreshAccessToken()

      if (!accessToken) {
        return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
      }
    }

    // Create headers with token
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }

    // Send request to backend
    const backendUrl = `http://localhost:3001/api/products/${id}`
    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Check response
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || `Failed to ${method.toLowerCase()} product` },
        { status: response.status },
      )
    }

    // Send response back to client
    const data = method !== "DELETE" ? await response.json() : null
    return NextResponse.json(
      {
        success: true,
        message: `Product ${method === "GET" ? "retrieved" : method === "PATCH" ? "updated" : "deleted"} successfully`,
        product: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error ${method.toLowerCase()}ing product:`, error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : `Failed to ${method.toLowerCase()} product`,
      },
      { status: 500 },
    )
  }
}

// GET /api/products/[id] - Get product by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  return sendToBackend(request, params.id, "GET")
}

// PATCH /api/products/[id] - Update product by ID
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return sendToBackend(request, params.id, "PATCH")
}

// DELETE /api/products/[id] - Delete product by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return sendToBackend(request, params.id, "DELETE")
}
