"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/app/hooks/use-media-query";

type DrawerSide = "left" | "right" | "top" | "bottom";

interface DrawerDialogProps {
  className?: string;
  isOpen?: boolean;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: DrawerSide;
  size?: string; // Tailwind width/height units
  variant?: "dialog" | "drawer" | undefined; // undefined = hybrid
  onClose?: () => void;
}

export const DrawerDialog: React.FC<DrawerDialogProps> = ({
  className,
  isOpen,
  trigger,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "80",
  variant,
  onClose,
}) => {
  const [open, setOpen] = React.useState(isOpen);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Decide if we should render dialog or drawer
  const useDialog =
    variant === "dialog" ? true : variant === "drawer" ? false : isDesktop;

  const drawerSizeClass = React.useMemo(() => {
    switch (side) {
      case "left":
        return `fixed inset-y-0 left-0 w-${size} max-w-full`;
      case "right":
        return `fixed inset-y-0 right-0 w-${size} max-w-full`;
      case "top":
        return `fixed inset-x-0 top-0 h-${size} max-h-full`;
      case "bottom":
        return `fixed inset-x-0 bottom-0 h-${size} max-h-full`;
      default:
        return "";
    }
  }, [side, size]);

  if (useDialog) {
    return (
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open && onClose) onClose();
        }}
      >
        <DialogContent className={cn("sm:max-w-[425px]", className)}>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} onClose={onClose}>
      <DrawerContent className={cn(drawerSizeClass, className)}>
        <DrawerHeader className="text-left">
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        {children}

        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
};
