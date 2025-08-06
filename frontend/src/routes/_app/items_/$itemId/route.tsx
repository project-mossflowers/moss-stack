import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { EditItemDialog } from '../../items/-components/edit-item-dialog'
import { DeleteItemDialog } from '../../items/-components/delete-item-dialog'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { itemsReadItemOptions } from '@/api/@tanstack/react-query.gen'
import { PageTitle } from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_app/items_/$itemId')({
  loader: ({ context: { queryClient }, params: { itemId } }) => {
    return queryClient.ensureQueryData(
      itemsReadItemOptions({
        path: { id: itemId },
      }),
    )
  },
  errorComponent: ErrorComponent,
  component: RouteComponent,
})

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full rounded-xl px-4 lg:px-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/items"
            search={{
              page: 1,
              size: 10,
              sort_by: 'created_at',
              sort_order: 'desc',
            }}
          >
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">
            Error loading item: {error?.message || 'Item not found'}
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteComponent() {
  const { itemId } = Route.useParams()

  const { data: item, isLoading } = useSuspenseQuery({
    ...itemsReadItemOptions({
      path: { id: itemId },
    }),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="mx-auto w-full rounded-xl px-4 lg:px-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/items"
              search={{
                page: 1,
                size: 10,
                sort_by: 'created_at',
                sort_order: 'desc',
              }}
            >
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading item details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="mx-auto w-full rounded-xl px-4 lg:px-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/items"
              search={{
                page: 1,
                size: 10,
                sort_by: 'created_at',
                sort_order: 'desc',
              }}
            >
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Item not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full rounded-xl px-4 lg:px-6">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link
              to="/items"
              search={{
                page: 1,
                size: 10,
                sort_by: 'created_at',
                sort_order: 'desc',
              }}
            >
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <PageTitle title="Item Details" />
          </div>
          <div className="flex items-center gap-2">
            <EditItemDialog item={item} ButtonProps={{ variant: 'outline' }} />
            <DeleteItemDialog
              item={item}
              ButtonProps={{ variant: 'outline' }}
              shouldNavigateOnDelete={true}
            />
          </div>
        </div>

        {/* Item details */}
        <div className="space-y-6">
          {/* Main content card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Owner ID: {item.owner_id}
                    </div>
                    <Badge variant="secondary">ID: {item.id}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {item.description || 'No description provided'}
                </p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span className="text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Updated:</span>
                  <span className="text-muted-foreground">
                    {new Date(item.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
