import { itemsCreateItemMutation } from '@/api/@tanstack/react-query.gen'
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
import { useHandleError } from '@/hooks/use-handle-error'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import {
  createItemSchema,
  type CreateItemData,
} from '@/routes/_app/items/-schemas'

export function CreateItemDialog() {
  const handleError = useHandleError()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const form = useForm<CreateItemData>({
    resolver: zodResolver(createItemSchema),
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const createItemMutation = useMutation({
    ...itemsCreateItemMutation(),
    onSuccess: () => {
      toast({
        title: 'Item created successfully',
      })
      form.reset()
      setOpen(false)
    },
    onError: handleError,
  })
  const handleSubmit = (data: CreateItemData) => {
    createItemMutation.mutate({
      body: data,
    })
  }
  const isLoading = createItemMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create item</DialogTitle>
          <DialogDescription>
            Add a new item to your collection
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-6 py-4 px-0"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="title"
                      disabled={isLoading}
                      {...field}
                    />
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
                    <Input
                      placeholder="description"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
