"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button/Button";

export function AuthSubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {children}
    </Button>
  );
}
