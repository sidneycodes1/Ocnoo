import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// Shared control styling: 2px black border, zero radius, thicker border on focus,
// no browser ring. Tokens only.
const base =
  "w-full min-h-[44px] px-3 py-2 bg-white text-black " +
  "border-2 border-black rounded-none font-sans " +
  "focus:outline-none focus:border-[3px] " +
  "placeholder:text-black " +
  "disabled:bg-disabled disabled:cursor-not-allowed ";

interface InputAsInput extends InputHTMLAttributes<HTMLInputElement> {
  multiline?: false;
}

interface InputAsTextarea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

type InputProps = InputAsInput | InputAsTextarea;

export default function Input({ className = "", ...props }: InputProps) {
  if (props.multiline) {
    const { multiline, ...rest } = props;
    return <textarea className={`${base}resize-y ${className}`} {...rest} />;
  }

  const { multiline, ...rest } = props;
  return <input className={base + className} {...rest} />;
}
