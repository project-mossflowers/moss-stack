import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='p-6'>Hello "/admin"!</div>
}
