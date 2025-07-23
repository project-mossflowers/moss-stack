import { DataTable } from '@/components/dashboard/data-table'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import data from '../dashboard/data.json'
import { PageTitle } from '@/components/page-title'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_app/items/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="mx-auto w-full rounded-xl flex items-center justify-between px-4 lg:px-6">
          <div>
            <PageTitle title="Item List" />
          </div>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're
                    done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value="Pedro Duarte"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value="@peduarte"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-4 px-4 lg:px-6">
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
          <div className="aspect-video rounded-xl bg-muted/50 h-84" />
        </div>

        <DataTable data={data} />
      </div>
    </>
  )
}
