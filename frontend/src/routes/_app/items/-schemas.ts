import z from 'zod'

export const createItemSchema = z.object({
  title: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Username is required'),
})

export type CreateItemData = z.infer<typeof createItemSchema>
