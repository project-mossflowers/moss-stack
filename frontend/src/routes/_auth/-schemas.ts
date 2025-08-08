import { z } from 'zod'

/**
 * 基础邮箱验证
 */
const emailSchema = z
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

/**
 * 基础密码验证
 */
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')

/**
 * 强密码验证（用于注册）
 */
const strongPasswordSchema = passwordSchema.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  'Password must contain at least one uppercase letter, one lowercase letter, and one number',
)

/**
 * 登录表单验证模式
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: passwordSchema,
})

/**
 * 注册表单验证模式
 */
export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string(),
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
