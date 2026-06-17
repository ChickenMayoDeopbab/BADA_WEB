import { useState } from "react";
import type { ReactNode, InputHTMLAttributes } from "react";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  variant?: "filled" | "standard" | "outlined";
  error?: string;
  success?: string;
  rightIcon?: ReactNode;
}

const variantClass: Record<string, string> = {
  filled: "bg-[#F2F4F6] rounded-lg",
  standard: "",
  outlined: "border border-[#BDBEBE] rounded-lg",
};

function getJosa(word: string): string {
  if (!word) return "을/를";
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "를";
  return (code - 0xac00) % 28 > 0 ? "을" : "를";
}

export default function CustomInput({
  label,
  variant = "standard",
  error = "",
  success = "",
  rightIcon,
  onFocus,
  onBlur,
  value,
  placeholder,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? "border-[#FF0000]"
    : isFocused
      ? "border-[#0D0D0E]"
      : success
        ? "border-[#09C357]"
        : "border-[#BDBEBE]"


  const resolvedPlaceholder = isFocused
    ? ""
    : (placeholder ?? (label ? `${label}${getJosa(label)} 입력하세요.` : ""));

  return (
    <div className="w-full">
      <div
        className={`
          flex flex-row items-center border-b
          ${variantClass[variant]}
          ${borderColor}
        `}
        style={{ minHeight: 35 }}
      >
        <input
          className="flex-1 p-0 text-lg font-medium text-[#0D0D0E] bg-transparent outline-none placeholder-[#BDBEBE]"
          placeholder={resolvedPlaceholder}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <div className="ml-2">{rightIcon}</div>}
      </div>

      <p
        className={`transition-opacity duration-100 ${error ? "opacity-100 text-[#FF0000]" : "opacity-0"} ${success ? "opacity-100 text-[#09C357]" : "opacity-0"}`}
        style={{ height: 16, marginTop: 4, fontSize: 12 }}
      >
        {error ?? " "}
        {success ?? " "}
      </p>
    </div>
  );
}