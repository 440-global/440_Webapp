"use client";

import React, { useEffect, useState } from "react";
import { cn } from "./utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  tag?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  styling?: string;
  genStyle?: string;
  required?: boolean;
};

function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function parseAmount(str: string): number {
  const cleaned = str.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const AmountInput = ({
  value,
  onChange,
  tag,
  name,
  placeholder = "0",
  disabled,
  styling = "",
  genStyle = "",
  required
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? formatAmount(value) : "");
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(value ? String(value) : "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
      setInputValue(raw);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseAmount(inputValue);
    onChange(num);
    setInputValue(num ? formatAmount(num) : "");
  };

  return (
    <div className={cn("my-4", genStyle)}>
      {tag && (
        <label className="block font-semibold mb-1">
          {tag}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full p-3 bg-(--bg-surface) rounded-lg border border-slate-200 focus:border focus:outline-(--primary)",
          styling,
        )}
      />
    </div>
  );
};

export default AmountInput;
