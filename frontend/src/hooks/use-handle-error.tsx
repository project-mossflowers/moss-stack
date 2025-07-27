import type { AxiosError } from 'axios'
import { useToast } from '@/hooks/use-toast'

export const useHandleError = () => {
  const { toast } = useToast()
  return (err: AxiosError) => {
    const errDetail = (err.response?.data as any)?.detail
    let errorMessage = errDetail || 'Something went wrong.'
    if (Array.isArray(errDetail) && errDetail.length > 0) {
      errorMessage = errDetail[0].msg
    }
    toast({
      title: `${err.status} ${err.code}` || 'Error',
      description: errorMessage || 'An unexpected error occurred.',
      variant: 'destructive',
      duration: 5000,
    })
    console.error('Error:', err)
  }
}
