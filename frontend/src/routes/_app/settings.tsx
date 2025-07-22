import { PageTitle } from '@/components/page-title'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full rounded-xl flex items-center justify-between px-4 lg:px-6">
        <div>
          <PageTitle title="Settings" />
        </div>
      </div>
    </div>
  )
}
