import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/oauth2/callback')({
  component: OAuth2Callback,
})

function OAuth2Callback() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token')

  if (accessToken) {
    localStorage.setItem('access_token', accessToken)
    window.location.href = '/'
  } else {
    window.location.href = '/login?error=oauth2_failed'
  }
}
