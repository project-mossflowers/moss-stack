import { LoginForm } from '@/routes/_auth/login/-components/login-form'
import { isLoggedIn } from '@/hooks/use-auth'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: '/',
      })
    }
  },
})

function RouteComponent() {
  return <LoginForm />
}
