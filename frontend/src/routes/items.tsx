import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/items')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='p-6'>Hello "/item"!</div>
}
