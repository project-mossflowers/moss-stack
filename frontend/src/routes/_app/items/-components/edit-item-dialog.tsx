import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { LoaderIcon, PencilIcon } from 'lucide-react'
import type { ItemPublic, ItemUpdate } from '@/api/types.gen'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  itemsReadItemQueryKey,
  itemsReadItemsQueryKey,
  itemsUpdateItemMutation,
} from '@/api/@tanstack/react-query.gen'

const updateItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(255, 'Description too long').optional(),
})

type UpdateItemForm = z.infer<typeof updateItemSchema>

interface EditItemDialogProps {
  item: ItemPublic
  onSuccess?: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  ButtonProps?: React.ComponentProps<typeof Button>
}

export function EditItemDialog({
  item,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange,
  ButtonProps,
}: EditItemDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const queryClient = useQueryClient()

  const form = useForm<UpdateItemForm>({
    resolver: zodResolver(updateItemSchema),
    defaultValues: {
      title: item.title,
      description: item.description || '',
    },
  })

  const updateMutation = useMutation({
    ...itemsUpdateItemMutation(),
    onSuccess: () => {
      toast.success('Item updated successfully')
      // Invalidate both items list and individual item caches
      queryClient.invalidateQueries({
        queryKey: itemsReadItemsQueryKey(),
      })
      queryClient.invalidateQueries({
        queryKey: itemsReadItemQueryKey({ path: { id: item.id } }),
      })
      setOpen(false)
      form.reset()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Failed to update item: ${error.message || 'Unknown error'}`)
    },
  })

  const onSubmit = (values: UpdateItemForm) => {
    const updateData: ItemUpdate = {
      title: values.title,
      description: values.description || null,
    }

    updateMutation.mutate({
      path: { id: item.id },
      body: updateData,
    })
  }

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: item.title,
        description: item.description || '',
      })
    }
  }, [open, item, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 px-2" {...ButtonProps}>
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit item</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to your item here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
