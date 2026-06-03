import { useState } from "react";
import type { ReactNode, InputHTMLAttributes } from "react";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  variant?: "filled" | "standard" | "outlined";
  error?: string;
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
  rightIcon,
  onFocus,
  onBlur,
  value,
  placeholder,
  ...props
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isError = Boolean(error);

  const borderColor = isError
    ? "border-[#FF0000]"
    : isFocused
      ? "border-[#0D0D0E]"
      : "border-[#BDBEBE]";

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
        className={`text-[#FF0000] transition-opacity duration-100 ${isError ? "opacity-100" : "opacity-0"}`}
        style={{ height: 16, marginTop: 4, fontSize: 12 }}
      >
        {error ?? " "}
      </p>
    </div>
  );
}