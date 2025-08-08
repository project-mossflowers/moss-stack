import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { UserPublic } from '@/api/types.gen'
import {
  usersDeleteUserMutation,
  usersReadUsersQueryKey,
} from '@/api/@tanstack/react-query.gen'
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
import { useHandleError } from '@/hooks/use-handle-error'
import useAuth from '@/hooks/use-auth'

interface DeleteUserDialogProps {
  user: UserPublic
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteUserDialog({
  user,
  children,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const queryClient = useQueryClient()
  const handleError = useHandleError()
  const { user: currentUser } = useAuth()

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const deleteUserMutation = useMutation({
    ...usersDeleteUserMutation(),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: usersReadUsersQueryKey() })
      setIsOpen(false)
    },
    onError: handleError,
  })

  const onConfirm = () => {
    deleteUserMutation.mutate({
      path: { user_id: user.id },
    })
  }

  // Prevent deleting self
  const canDelete = currentUser?.id !== user.id

  if (!canDelete) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TrashIcon className="h-5 w-5 text-destructive" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the user{' '}
            <strong>{user.email}</strong>?
            <br />
            <br />
            This action cannot be undone. The user will immediately lose access
            to the system and all associated data may be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleteUserMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
