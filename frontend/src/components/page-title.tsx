import { cn, toTitle } from "@/lib/utils"
import { useLocation } from "@tanstack/react-router"



export function PageTitle({className, ...props}: React.HTMLAttributes<HTMLHeadingElement>) {
    const title = useLocation().pathname.split('/').pop()
  return (
      <h1 className={cn("text-2xl font-bload", className)} {...props}>{title?toTitle(title):'Home'}</h1>
  )
}