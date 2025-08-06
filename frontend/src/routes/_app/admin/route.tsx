import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { CreateUserDialog } from './-components/create-user-dialog'
import { UsersTable } from './-components/users-table'
import { usersReadUsersOptions } from '@/api/@tanstack/react-query.gen'
import { PageTitle } from '@/components/page-title'
import useAuth from '@/hooks/use-auth'

const usersSearchSchema = z.object({
  skip: z.number().catch(0),
  limit: z.number().catch(100),
})

function getUsersQueryOptions(params: z.infer<typeof usersSearchSchema>) {
  return usersReadUsersOptions({
    query: {
      skip: params.skip,
      limit: params.limit,
    },
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

      <div className="mx-auto w-full px-4 lg:px-6">
        <UsersTable data={result.data} isLoading={result.isLoading} />
      </div>
    </div>
  )
}
