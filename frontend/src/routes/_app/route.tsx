import { AppSidebar } from '@/components/layout/default/app-sidebar'
import { SiteHeader } from '@/components/layout/default/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { isLoggedIn } from '@/hooks/use-auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: '/login',
      })
    }
  },
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
