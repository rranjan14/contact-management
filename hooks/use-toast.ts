"use client"

import { useMemo } from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning" | "info"
}

const useToast = () => {
  const toast = useMemo(() => {
    return (props: ToastProps) => {
      const { title, description, action, variant, ...rest } = props
      
      if (variant === "destructive") {
        return sonnerToast.error(title, { description, action, ...rest })
      }
      
      if (variant === "success") {
        return sonnerToast.success(title, { description, action, ...rest })
      }
      
      if (variant === "warning") {
        return sonnerToast.warning(title, { description, action, ...rest })
      }
      
      if (variant === "info") {
        return sonnerToast.info(title, { description, action, ...rest })
      }
      
      return sonnerToast(title || "", { description, action, ...rest })
    }
  }, []);

  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  }
}

export { useToast }
