"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RiMore2Fill } from "react-icons/ri";
import { cn } from "./utils";

type ActionItem = {
  label?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  primary?: boolean;
};

type Props = {
  actions: ActionItem[];
  position?: (rect: DOMRect) => React.CSSProperties;
  offset?: number;
  children?: React.ReactNode;
};

const ActionDropdown = ({ actions, position, offset = 6, children }: Props) => {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const toggle = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    setRect(buttonRect);
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuWidth = children ? 208 : 160;

  // Default position (bottom-left)
  const defaultPosition = (rect: DOMRect): React.CSSProperties => ({
    top: rect.bottom + offset,
    left: Math.max(8, rect.right - menuWidth), // keep 8px from the screen edge
    minWidth: menuWidth,
  });

  const computedStyle: React.CSSProperties | undefined =
    rect
      ? position
        ? position(rect)
        : defaultPosition(rect)
      : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggle}
        className="p-2 rounded-md hover:bg-(--muted) relative"
      >
        <RiMore2Fill />
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="absolute z-1000 min-w-40 bg-(--surface) border border-(--table-border) rounded-md shadow-lg p-1"
            style={computedStyle}
          >
            {actions.map((action) => (
              <li
                key={action.label}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm",
                  "hover:bg-(--muted)",
                  action.danger && "text-red-600 hover:bg-red-50",
                  action.primary && "text-(--primary) hover:bg-(--primary)/20",
                )}
              >
                {action.icon}
                {action.label}

                {}
              </li>
            ))}
            {children && (
              <li className="mt-1 border-t border-(--table-border) pt-1">
                {children}
              </li>
            )}
          </ul>,
          document.body,
        )}
    </>
  );
};

export default ActionDropdown;