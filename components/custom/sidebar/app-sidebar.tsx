"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  QrCode,
  ReceiptText,
  UsersRound,
  Zap,
} from "lucide-react";

import { SideBarCalendar } from "@/components/custom/sidebar/sidebar-calendar";
import { NavUser } from "@/components/custom/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <SideBarCalendar />
        <SidebarSeparator className="mx-0" />
        {/* <Calendars calendars={data.calendars} /> */}
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/bills')}>
              <Link href="/admin/bills">
                <ReceiptText />
                <span>Bills</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/properties')}>
              <Link href="/admin/properties">
                <Home />
                <span>Properties</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/utilities')}>
              <Link href="/admin/utilities">
                <Zap />
                <span>Utilities</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/renters')}>
              <Link href="/admin/renters">
                <UsersRound />
                <span>Renters</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 pb-6 mt-auto">
        <div className="flex items-center justify-center gap-2.5 py-2.5 px-5 bg-white/60 backdrop-blur-xl rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] mx-auto w-fit transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:bg-white/80">
          <div className="relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
            V.{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppRenterSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <SideBarCalendar />
        <SidebarSeparator className="mx-0" />
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/renter/dashboard')}>
              <Link href="/renter/dashboard">
                <LayoutGrid />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/renter/channels')}>
              <Link href="/renter/channels">
                <QrCode />
                <span>QR Payments</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <Calendars calendars={data.calendars} /> */}
        {/* <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/bills">
                <ReceiptText />
                <span>Bills</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/properties">
                <Home />
                <span>Properties</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/renters">
                <UsersRound />
                <span>Renters</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
      </SidebarContent>
      <SidebarFooter className="p-4 pb-6 mt-auto">
        <div className="flex items-center justify-center gap-2.5 py-2.5 px-5 bg-white/60 backdrop-blur-xl rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] mx-auto w-fit transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:bg-white/80">
          <div className="relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
            V.{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
