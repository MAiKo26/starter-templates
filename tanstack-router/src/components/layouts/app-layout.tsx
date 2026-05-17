import * as React from "react"

import { useLocation } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"

import { FolderKanban, LayoutDashboard, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    to: "/",
  },
  {
    title: "Projects",
    icon: FolderKanban,
    to: "/projects",
  },
]

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Button
          key={item.to}
          variant={pathname === item.to ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          asChild
        >
          <Link to={item.to}>
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="bg-background hidden w-64 flex-col border-r p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <FolderKanban className="size-4" />
          </div>
          <span className="font-semibold">TaskFlow</span>
        </div>
        <Separator className="mb-4" />
        <SidebarNav pathname={pathname} />
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="fixed top-4 left-4 z-40 md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <div className="mb-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <FolderKanban className="size-4" />
              </div>
              <span className="font-semibold">TaskFlow</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <Separator className="mb-4" />
          <SidebarNav pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
