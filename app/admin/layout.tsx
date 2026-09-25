"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/custom/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import NoAccess from "@/components/custom/no-access";
import { cn } from "@/lib/utils";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (user && !user?.type) {
    return <NoAccess />;
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    return { href, label };
  });

  return (
    <SidebarProvider className={cn(!user?.type && "hidden")}>
      <AppSidebar />
      <SidebarInset className="bg-[#eaebed]">
        <header className="sticky top-4 z-50 mt-4 mb-6 flex min-h-[56px] h-auto py-2 shrink-0 items-center gap-3 bg-white/90 backdrop-blur-xl border border-white/80 px-5 mx-4 rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all">
          <SidebarTrigger className="-ml-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600 hover:text-zinc-900" />
          <Separator
            orientation="vertical"
            className="h-5 w-[1px] bg-zinc-200/80"
          />
          <Breadcrumb>
            <BreadcrumbList className="sm:gap-2">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.href}>
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="font-black text-zinc-900 tracking-tight text-[15px]">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href} className="text-[13px] font-bold text-zinc-400 hover:text-zinc-800 transition-colors uppercase tracking-widest">
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator className="text-zinc-300" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
