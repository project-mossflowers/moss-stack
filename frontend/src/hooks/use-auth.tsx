import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  authLdapLoginMutation,
  authLdapStatusOptions,
  authLoginAccessTokenMutation,
  usersReadUserMeOptions,
  usersRegisterUserMutation,
} from '@/api/@tanstack/react-query.gen'
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

  const { data: ldapStatus } = useQuery({
    ...authLdapStatusOptions(),
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

  const ldapLoginMutation = useMutation({
    ...authLdapLoginMutation(),
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
    ldapLoginMutation,
    logout,
    user,
    isAuthenticated: isLoggedIn(),
    ldapStatus,
    isLdapEnabled: ldapStatus?.ldap_enabled || false,
    isLdapConfigured: ldapStatus?.ldap_configured || false,
  }
}

export { isLoggedIn }
export default useAuth
