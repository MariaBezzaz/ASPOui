import type { ReactNode } from "react"
import Link from "next/link"
import { BarChart3, Home, LayoutDashboard } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import ClassListSidebar from "@/components/class-list-sidebar"
import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Main Navigation Sidebar with Class List */}
        <Sidebar collapsible="icon">
          <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
            <div className="flex items-center justify-center w-full font-bold py-2">
              <Logo width={80} height={30} />
            </div>
          </SidebarHeader>
          <SidebarContent className="pt-2">
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" className="px-2 py-2">
                  <Link href="/dashboard">
                    <BarChart3 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarSeparator className="my-2" />

            {/* Class List integrated into the left sidebar */}
            <div className="flex-1 overflow-hidden px-2">
              <ClassListSidebar />
            </div>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7">
                <LayoutDashboard className="h-5 w-5 text-purple-500" />
              </div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto w-full">
            <div className="w-full px-4 py-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
