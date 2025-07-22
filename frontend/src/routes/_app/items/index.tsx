import { DataTable } from '@/components/dashboard/data-table'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import data from '../dashboard/data.json'
import { PageTitle } from '@/components/page-title'

export const Route = createFileRoute('/_app/items/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="mx-auto w-full rounded-xl flex items-center justify-between px-4 lg:px-6">
          <div>
            <PageTitle />
          </div>
          <div>
            <Button>Add Item</Button>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-4 px-4 lg:px-6">
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
        </div>

        <DataTable data={data} />
      </div>
    </>
  )
}
