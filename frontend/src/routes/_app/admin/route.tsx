import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { CreateUserDialog } from './-components/create-user-dialog'
import { UsersTable } from './-components/users-table'
import { usersReadUsersOptions } from '@/api/@tanstack/react-query.gen'
import { PageTitle } from '@/components/page-title'
import { SortOrder, UserSortField } from '@/api/types.gen'
import useAuth from '@/hooks/use-auth'

const usersSearchSchema = z.object({
  page: z.number().catch(1),
  size: z.number().catch(10),
  search: z.string().optional(),
  sort_by: z
    .enum([
      UserSortField.EMAIL,
      UserSortField.FULL_NAME,
      UserSortField.CREATED_AT,
      UserSortField.UPDATED_AT,
    ])
    .catch(UserSortField.CREATED_AT),
  sort_order: z.enum([SortOrder.ASC, SortOrder.DESC]).catch(SortOrder.DESC),
})

function getUsersQueryOptions(params: z.infer<typeof usersSearchSchema>) {
  const query: any = {
    page: params.page,
    size: params.size,
  }

  if (params.search) query.search = params.search
  if (params.sort_by) query.sort_by = params.sort_by
  if (params.sort_order) query.sort_order = params.sort_order

  return usersReadUsersOptions({
    query,
  })
}

export const Route = createFileRoute('/_app/admin')({
  component: RouteComponent,
  validateSearch: zodValidator(usersSearchSchema),
  beforeLoad: () => {
    // Check if user is authenticated and is superuser
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
})

function RouteComponent() {
  const { user } = useAuth()
  const searchParams = Route.useSearch()

  // Redirect if not superuser
  if (user && !user.is_superuser) {
    throw redirect({ to: '/' })
  }

  const result = useQuery({
    ...getUsersQueryOptions(searchParams),
    placeholderData: (prevData) => prevData,
  })

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full rounded-xl flex items-center justify-between px-4 lg:px-6">
        <div>
          <PageTitle title="User Management" />
        </div>
        <CreateUserDialog />
      </div>

      <UsersTable
        data={result.data?.data || []}
        pagination={
          result.data
            ? {
                page: result.data.page,
                size: result.data.size,
                total: result.data.total,
                pages: result.data.pages,
              }
            : undefined
        }
        searchParams={searchParams}
      />
    </div>
  )
}
