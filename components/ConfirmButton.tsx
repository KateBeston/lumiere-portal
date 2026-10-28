"use client";
import { useTransition } from "react";

export default function ConfirmButton({
  action,
  message,
  label,
  className = "linkbtn",
}: {
  action: () => Promise<void>;
  message: string;
  label: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) start(() => action());
      }}
    >
      {pending ? "Working…" : label}
    </button>
  );
}
