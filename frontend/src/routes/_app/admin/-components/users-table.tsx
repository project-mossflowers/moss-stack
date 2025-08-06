import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  MoreVerticalIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UserIcon,
} from 'lucide-react'
import { EditUserDialog } from './edit-user-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import type { ColumnDef } from '@tanstack/react-table'

import type { UserPublic, UsersPublic } from '@/api/types.gen'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const columns: Array<ColumnDef<UserPublic>> = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue('email')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'full_name',
    header: 'Full Name',
    cell: ({ row }) => row.getValue('full_name') || '—',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
        {row.getValue('is_active') ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    accessorKey: 'is_superuser',
    header: 'Role',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.getValue('is_superuser') ? (
          <>
            <ShieldCheckIcon className="h-4 w-4 text-red-500" />
            <Badge variant="destructive">Admin</Badge>
          </>
        ) : (
          <>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">User</Badge>
          </>
        )}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditUserDialog user={user}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit User
              </DropdownMenuItem>
            </EditUserDialog>
            <DropdownMenuSeparator />
            <DeleteUserDialog user={user}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
              >
                Delete User
              </DropdownMenuItem>
            </DeleteUserDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface UsersTableProps {
  data?: UsersPublic
  isLoading?: boolean
}

export function UsersTable({ data, isLoading }: UsersTableProps) {
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {data?.count ?? 0} users total
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
