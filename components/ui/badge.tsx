import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-[hsl(152_45%_92%)] text-[hsl(171_67%_18%)]",
        warning: "bg-[hsl(41_80%_90%)] text-[hsl(35_70%_28%)]",
        danger: "bg-destructive/10 text-destructive",
        muted: "bg-muted text-muted-foreground",
        gold: "bg-[hsl(41_60%_90%)] text-[hsl(35_72%_30%)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
