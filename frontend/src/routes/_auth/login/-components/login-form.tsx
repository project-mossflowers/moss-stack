import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AppleIcon, GoogleIcon } from '@/components/ui/icons'
import useAuth from '@/hooks/use-auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginSchema, type LoginFormData } from '@/routes/_auth/-schemas'
import { Link } from '@tanstack/react-router'

export interface LoginFormProps extends React.ComponentPropsWithoutRef<'div'> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const { loginMutation } = useAuth()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const handleSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      body: data,
    })
  }

  const isLoading = loginMutation.isPending

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isLoading}
                  >
                    <AppleIcon />
                    Login with Apple
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isLoading}
                  >
                    <GoogleIcon />
                    Login with Google
                  </Button>
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example@example.com"
                              type="email"
                              autoComplete="email"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Password</FormLabel>
                            <a
                              href="#"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              Forgot your password?
                            </a>
                          </div>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Login'}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/signup"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
