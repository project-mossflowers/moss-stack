import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import type { QueryClient } from '@tanstack/react-query'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx'
import { AppSidebar } from '@/components/layout/default/app-sidebar.tsx'
import { SiteHeader } from '@/components/layout/default/site-header.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />

      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
})
