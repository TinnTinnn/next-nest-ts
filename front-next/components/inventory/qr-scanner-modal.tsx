"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, QrCode, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface QRScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanResult: (result: string) => void
}

export function QRScannerModal({ open, onOpenChange, onScanResult }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsScanning(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions or use manual input.",
        variant: "destructive",
      })
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  // Handle manual input
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScanResult(manualInput.trim())
      setManualInput("")
      onOpenChange(false)
    }
  }

  // Simulate QR scan (for demo purposes)
  const simulateScan = () => {
    // Simulate scanning a product ID
    const sampleProductIds = ["P001", "P002", "P003", "P004", "P005"]
    const randomId = sampleProductIds[Math.floor(Math.random() * sampleProductIds.length)]
    onScanResult(randomId)
    onOpenChange(false)
    toast({
      title: "QR Code Scanned",
      description: `Product ID: ${randomId} (Demo scan)`,
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Stop camera when modal closes
  useEffect(() => {
    if (!open) {
      stopCamera()
      setManualInput("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>QR/Barcode Scanner</DialogTitle>
          <DialogDescription>Scan a QR code or barcode to search for products</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camera Section */}
          <div className="space-y-4">
            <Label>Camera Scanner</Label>
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              {isScanning ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play()
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="absolute top-2 right-2" onClick={stopCamera}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Camera not active</p>
                  <Button onClick={startCamera} variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                </div>
              )}
            </div>
            {isScanning && (
              <div className="flex justify-center space-x-2">
                <Button onClick={simulateScan} variant="default">
                  Simulate Scan (Demo)
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Stop Camera
                </Button>
              </div>
            )}
          </div>

          {/* Manual Input Section */}
          <div className="space-y-4">
            <Label htmlFor="manual-input">Manual Input</Label>
            <div className="flex space-x-2">
              <Input
                id="manual-input"
                placeholder="Enter product ID or barcode"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleManualSubmit()
                  }
                }}
              />
              <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                Search
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
