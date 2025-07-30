import { createFileRoute, useNavigate } from '@tanstack/react-router'
import data from '../dashboard/data.json'
import { PageTitle } from '@/components/page-title'

import z from 'zod'
import { itemsReadItems } from '@/api'
import { itemsReadItemQueryKey } from '@/api/@tanstack/react-query.gen'
import { useQuery } from '@tanstack/react-query'
import { CreateItemDialog } from './-components/create-item-dialog'
import { DataTable } from './-components/items-table'

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getItemsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      itemsReadItems({
        query: { skip: (page - 1) * PER_PAGE, limit: PER_PAGE },
      }),
    queryKey: [itemsReadItemQueryKey, { page }],
  }
}

export const Route = createFileRoute('/_app/items')({
  component: RouteComponent,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const result = useQuery({
    ...getItemsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  return (
    <>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="mx-auto w-full rounded-xl flex items-center justify-between px-4 lg:px-6">
          <div>
            <PageTitle title="Item List" />
          </div>
          <div>
            <CreateItemDialog />
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
