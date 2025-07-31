import { createFileRoute } from '@tanstack/react-router'
import { PageTitle } from '@/components/page-title'

import { z } from 'zod'
import { itemsReadItemsOptions } from '@/api/@tanstack/react-query.gen'
import { useQuery } from '@tanstack/react-query'
import { CreateItemDialog } from './-components/create-item-dialog'
import { DataTable } from './-components/items-table'

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
  size: z.number().catch(10),
})

function getItemsQueryOptions({ page, size }: { page: number; size: number }) {
  return itemsReadItemsOptions({
    query: { page, size },
  })
}

export const Route = createFileRoute('/_app/items')({
  component: RouteComponent,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

function RouteComponent() {
  const { page, size } = Route.useSearch()

  const result = useQuery({
    ...getItemsQueryOptions({ page, size }),
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

        {result.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading items...</div>
          </div>
        ) : result.isError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">
              Error loading items: {result.error?.message || 'Unknown error'}
            </div>
          </div>
        ) : (
          <DataTable 
            data={result.data?.data || []} 
            pagination={{
              page: result.data?.page || 1,
              size: result.data?.size || 10,
              total: result.data?.total || 0,
              pages: result.data?.pages || 1,
            }}
          />
        )}
      </div>
    </>
  )
}
