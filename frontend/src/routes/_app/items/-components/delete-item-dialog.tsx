import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LoaderIcon, TrashIcon } from "lucide-react"

import { itemsDeleteItemMutation, itemsReadItemsQueryKey } from "@/api/@tanstack/react-query.gen"
import type { ItemPublic } from "@/api/types.gen"

interface DeleteItemDialogProps {
  item: ItemPublic
  onSuccess?: () => void
}

export function DeleteItemDialog({ item, onSuccess }: DeleteItemDialogProps) {
  const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    ...itemsDeleteItemMutation(),
    onSuccess: () => {
      toast.success("Item deleted successfully")
      // 使用正确的查询键来失效缓存
      queryClient.invalidateQueries({ 
        queryKey: itemsReadItemsQueryKey() 
      })
      setOpen(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Failed to delete item: ${error.message || "Unknown error"}`)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({
      path: { id: item.id },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete item</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item "{item.title}".
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
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}