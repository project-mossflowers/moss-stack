import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Link, useLocation } from '@tanstack/react-router'

export function SiteHeader() {
  const pathname = useLocation().pathname
  const pathSegments = pathname.split('/').filter(Boolean)

  const toTitle = (item: string) =>
    item.charAt(0).toUpperCase() + item.slice(1)

  const SiteHeaderBreadcrumb = () => (
    <Breadcrumb>
      <BreadcrumbList>
        {pathname === '/' ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            {pathSegments.map((item, index) => {
              const isLast = index === pathSegments.length - 1
              const to = '/' + pathSegments.slice(0, index + 1).join('/')
              return (
                <BreadcrumbItem key={to}>
                  {isLast ? (
                    <BreadcrumbPage>{toTitle(item)}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link to={to}>{toTitle(item)}</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              )
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <SiteHeaderBreadcrumb />
      </div>
    </header>
  )
}
