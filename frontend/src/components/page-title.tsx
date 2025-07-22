import { cn } from "@/lib/utils"



export function PageTitle({ title, className, ...props }: { title: string } & React.HTMLAttributes<HTMLHeadingElement>) {

  return (
      <h1 className={cn("text-2xl font-bload", className)} {...props}>{title}</h1>
  )
}