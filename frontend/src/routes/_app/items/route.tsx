import { createFileRoute } from '@tanstack/react-router'

import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-adapter'
import { CreateItemDialog } from './-components/create-item-dialog'
import { DataTable } from './-components/items-table'
import { itemsReadItemsOptions } from '@/api/@tanstack/react-query.gen'
import { PageTitle } from '@/components/page-title'
import { ItemSortField, SortOrder } from '@/api/types.gen'

const itemsSearchSchema = z.object({
  page: z.number().catch(1),
  size: z.number().catch(10),
  search: z.string().optional(),
  sort_by: z.enum(ItemSortField).catch(ItemSortField.CREATED_AT),
  sort_order: z.enum(SortOrder).catch(SortOrder.DESC),
})

function getItemsQueryOptions(params: z.infer<typeof itemsSearchSchema>) {
  const query: any = {
    page: params.page,
    size: params.size,
  }

  if (params.search) query.search = params.search
  if (params.sort_by) query.sort_by = params.sort_by
  if (params.sort_order) query.sort_order = params.sort_order

  return itemsReadItemsOptions({
    query,
  })
}

export const Route = createFileRoute('/_app/items')({
  component: RouteComponent,
  validateSearch: zodValidator(itemsSearchSchema),
})

function RouteComponent() {
  const searchParams = Route.useSearch()

  const result = useQuery({
    ...getItemsQueryOptions(searchParams),
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
            searchParams={searchParams}
          />
        )}
      </div>
    </>
  )
}
