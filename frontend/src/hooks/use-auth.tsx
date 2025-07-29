import {
  authLoginAccessTokenMutation,
  usersReadUserMeOptions,
  usersRegisterUserMutation,
} from '@/api/@tanstack/react-query.gen'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useHandleError } from '@/hooks/use-handle-error'

const getToken = () => localStorage.getItem('access_token')
const isLoggedIn = () => getToken() !== null

const useAuth = () => {
  const navigate = useNavigate()
  const handleError = useHandleError()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    ...usersReadUserMeOptions(),
    enabled: isLoggedIn(),
  })

  const signupMutation = useMutation({
    ...usersRegisterUserMutation(),
    onSuccess: () => navigate({ to: '/login' }),
    onError: handleError,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: usersReadUserMeOptions().queryKey,
      }),
  })

  const loginMutation = useMutation({
    ...authLoginAccessTokenMutation(),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token)
      queryClient.invalidateQueries({
        queryKey: usersReadUserMeOptions().queryKey,
      })
      navigate({ to: '/' })
    },
    onError: handleError,
  })

  const logout = () => {
    localStorage.removeItem('access_token')
    queryClient.clear()
    navigate({ to: '/login' })
  }

  return {
    signupMutation: signupMutation,
    loginMutation,
    logout,
    user,
    isAuthenticated: isLoggedIn(),
  }
}

export { isLoggedIn }
export default useAuth
