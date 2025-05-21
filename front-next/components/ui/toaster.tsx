"use client"
import { useToast } from "@/components/ui/use-toast"
import { ToastClose } from "@/components/ui/toast"
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ ...props }) => (
        <Toast key={props.id} {...props}>
          {props.title && <ToastTitle>{props.title}</ToastTitle>}
          {props.description && <ToastDescription>{props.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export { Toaster }
