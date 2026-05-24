"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-[#94A3B8] mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-[#0B0F14] border border-[#273244] rounded-xl text-[#E2E8F0] placeholder-[#64748B] transition-colors focus:border-[#64748B]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
