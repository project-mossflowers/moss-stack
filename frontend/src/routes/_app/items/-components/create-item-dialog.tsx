import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

import { LoaderIcon, PlusIcon } from 'lucide-react'
import type { ItemCreate } from '@/api/types.gen'
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
  itemsCreateItemMutation,
  itemsReadItemsQueryKey,
} from '@/api/@tanstack/react-query.gen'

const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(255, 'Description too long').optional(),
})

type CreateItemForm = z.infer<typeof createItemSchema>

interface CreateItemDialogProps {
  onSuccess?: () => void
}

export function CreateItemDialog({ onSuccess }: CreateItemDialogProps) {
  const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateItemForm>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const createMutation = useMutation({
    ...itemsCreateItemMutation(),
    onSuccess: () => {
      toast.success('Item created successfully')
      // Invalidate all items queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: itemsReadItemsQueryKey(),
      })
      setOpen(false)
      form.reset()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Failed to create item: ${error.message || 'Unknown error'}`)
    },
  })

  const onSubmit = (values: CreateItemForm) => {
    const createData: ItemCreate = {
      title: values.title,
      description: values.description || null,
    }

    createMutation.mutate({
      body: createData,
    })
  }

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
      })
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
          <DialogDescription>
            Add a new item to your collection. Click save when you're done.
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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
