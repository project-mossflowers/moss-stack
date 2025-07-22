import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/items')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='p-6'>Hello "/item"!</div>
}
