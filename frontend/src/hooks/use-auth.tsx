import {
  authLoginAccessTokenMutation,
  usersReadUserMeOptions,
  usersRegisterUserMutation,
} from '@/api/@tanstack/react-query.gen'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useHandleError } from '@/hooks/use-handle-error'

const isLoggedIn = () => {
  return localStorage.getItem('access_token') !== null
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const handleError = useHandleError()

  const { data: user } = useQuery({
    ...usersReadUserMeOptions(),
    enabled: isLoggedIn(),
  })

  const signUpMutation = useMutation({
    ...usersRegisterUserMutation(),
    onSuccess: () => {
      navigate({ to: '/login' })
    },
    onError: handleError,
  })

  const loginMutation = useMutation({
    ...authLoginAccessTokenMutation(),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token)
      navigate({ to: '/' })
    },
    onError: handleError,
  })

  const logout = () => {
    localStorage.removeItem('access_token')
    navigate({ to: '/login' })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn }
export default useAuth
