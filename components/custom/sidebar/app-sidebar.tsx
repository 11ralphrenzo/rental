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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const adminNavItems = [
  { name: "Properties", href: "/admin/properties", icon: Home },
  { name: "Renters", href: "/admin/renters", icon: UsersRound },
  { name: "Bills", href: "/admin/bills", icon: ReceiptText },
  { name: "Utilities", href: "/admin/utilities", icon: Zap },
];

const renterNavItems = [
  { name: "Dashboard", href: "/renter/dashboard", icon: LayoutGrid },
  { name: "QR Payments", href: "/renter/channels", icon: QrCode },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="pt-2 pb-2">
        <NavUser user={user} />
      </SidebarHeader>
      
      <SidebarContent className="gap-0">
        <SidebarGroup className="pt-2 pb-0">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2 px-2">Main Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-2 px-2">
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive} 
                    className={`transition-all duration-300 rounded-[16px] px-4 py-5 ${
                      isActive 
                        ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20 hover:bg-zinc-800 hover:text-white data-[active=true]:bg-zinc-900 data-[active=true]:text-white" 
                        : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900 hover:shadow-sm"
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                      <span className="font-bold text-[13px] tracking-wide">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-4 px-2">
          <SideBarCalendar />
        </div>
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

export function AppRenterSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="pt-2 pb-2">
        <NavUser user={user} />
      </SidebarHeader>
      
      <SidebarContent className="gap-0">
        <SidebarGroup className="pt-2 pb-0">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2 px-2">Main Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-2 px-2">
            {renterNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive} 
                    className={`transition-all duration-300 rounded-[16px] px-4 py-5 ${
                      isActive 
                        ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20 hover:bg-zinc-800 hover:text-white data-[active=true]:bg-zinc-900 data-[active=true]:text-white" 
                        : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900 hover:shadow-sm"
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                      <span className="font-bold text-[13px] tracking-wide">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-4 px-2">
          <SideBarCalendar />
        </div>
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
