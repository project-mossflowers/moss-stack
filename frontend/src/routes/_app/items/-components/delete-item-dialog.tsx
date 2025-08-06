import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { LoaderIcon, TrashIcon } from 'lucide-react'
import type { ItemPublic } from '@/api/types.gen'
import { toast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import {
  itemsDeleteItemMutation,
  itemsReadItemQueryKey,
  itemsReadItemsQueryKey,
} from '@/api/@tanstack/react-query.gen'

interface DeleteItemDialogProps {
  item: ItemPublic
  onSuccess?: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  ButtonProps?: React.ComponentProps<typeof Button>
  shouldNavigateOnDelete?: boolean // New prop to control navigation behavior
}

export function DeleteItemDialog({
  item,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange,
  ButtonProps,
  shouldNavigateOnDelete = false,
}: DeleteItemDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const queryClient = useQueryClient()
  const router = useRouter()

  const deleteMutation = useMutation({
    ...itemsDeleteItemMutation(),
    onSuccess: () => {
      toast.success('Item deleted successfully')
      // Invalidate both items list and individual item caches
      queryClient.invalidateQueries({
        queryKey: itemsReadItemsQueryKey(),
      })
      queryClient.invalidateQueries({
        queryKey: itemsReadItemQueryKey({ path: { id: item.id } }),
      })
      setOpen(false)

      // Navigate to items list if this is from a detail page
      if (shouldNavigateOnDelete) {
        router.navigate({
          to: '/items',
          search: {
            page: 1,
            size: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
          },
        })
      }

      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Failed to delete item: ${error.message || 'Unknown error'}`)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({
      path: { id: item.id },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      {!trigger && controlledOpen === undefined && (
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive"
            {...ButtonProps}
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete item</span>
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item
            "{item.title}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
