import { toast, type ExternalToast } from 'sonner'
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'
import React from 'react'

export const useToast = () => {
  return {
    success: (message: string, description?: string) =>
      toast(message, {
        description,
        icon: React.createElement(CheckCircle, { className: 'text-green-500' }),
        style: { background: '#ecfdf5', color: '#065f46' }
      }),

    error: (message: string, description?: string) =>
      toast(message, {
        description,
        icon: React.createElement(AlertCircle, { className: 'text-red-500' }),
        style: { background: '#fef2f2', color: '#b91c1c' }
      }),

    info: (message: string, description?: string) =>
      toast(message, {
        description,
        icon: React.createElement(Info, { className: 'text-blue-500' }),
        style: { background: '#eff6ff', color: '#1e40af' }
      }),

    warning: (message: string, description?: string) =>
      toast(message, {
        description,
        icon: React.createElement(XCircle, { className: 'text-yellow-500' }),
        style: { background: '#fef9c3', color: '#b45309' }
      })
  }
}
