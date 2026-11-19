"use client"

import { useState, useCallback, ChangeEvent } from "react";

// Immutable set by dot-path: setIn(obj, "a.b.c", 1)
function setIn<T extends object>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const current = (obj as Record<string, unknown>)[head];

  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[Number(head)] =
      rest.length === 0
        ? value
        : setIn(copy[Number(head)] ?? {}, rest.join("."), value);
    return copy as unknown as T;
  }

  return {
    ...obj,
    [head]:
      rest.length === 0
        ? value
        : setIn(
            (current && typeof current === "object" ? current : {}) as object,
            rest.join("."),
            value,
          ),
  };
}

// Read by dot-path (used to check the existing value's type)
function getIn(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

export function useNestedForm<T extends object>(defaults: T) {
  const [formValues, setFormValues] = useState<T>(defaults);

  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, type, value } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormValues((prev) => {
        let next: unknown = value;

        if (type === "checkbox") {
          next = checked;
        } else if (typeof getIn(prev, name) === "number" || type === "number") {
          next = value === "" ? 0 : Number(value);
        }

        return setIn(prev, name, next);
      });
    },
    [],
  );

  const reset = useCallback(() => setFormValues(defaults), [defaults]);
  const setField = useCallback(
    (path: string, value: unknown) =>
      setFormValues((prev) => setIn(prev, path, value)),
    [],
  );

  return { formValues, setFormValues, handleChange, reset, setField };
}
