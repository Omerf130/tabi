import type { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.scss";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      className={[styles.control, className].filter(Boolean).join(" ")}
    />
  );
}
