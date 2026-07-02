"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function PasswordInput({ value, onChange, className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-border px-4 py-3 pr-11 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
      >
        {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
