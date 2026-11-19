"use client"
import { Button, Card, Input } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { RiCloseLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
// TODO: point this at your real change-password mutation
import { useChangePasswordAuth } from '@/api/auth'
import { useNestedForm } from '@/hooks/use-nested-form'
import { ChangePasswordAuth } from '@/types/types'
import { toast } from 'react-toastify'

type Props = {
  onClose: () => void
}

const defaultValues: ChangePasswordAuth = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const ChangePasswordModal = ({ onClose }: Props) => {
  const { mutateAsync: changePassword, isPending } = useChangePasswordAuth();
  const { formValues, setFormValues, handleChange } = useNestedForm<ChangePasswordAuth>(defaultValues);
  const [serverError, setServerError] = useState("");

  // close on Escape + lock background scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, isPending])

  const errors = {
    current: !formValues.currentPassword ? "Enter your current password" : "",
    next: !formValues.newPassword
      ? "Enter a new password"
      : formValues.newPassword.length < 8
        ? "Use at least 8 characters"
        : formValues.newPassword === formValues.currentPassword
          ? "New password must be different from the current one"
          : "",
    confirm:
      formValues.confirmPassword !== formValues.newPassword
        ? "Passwords do not match"
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (hasErrors) return;

    // adjust the payload keys to match your API
    const { currentPassword, newPassword, confirmPassword } = formValues;
    changePassword(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          onClose();
          toast.success('Password changed successfully')
        },
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.message ??
            err?.message ??
            'Could not change password. Please try again.'
          )
      },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <Card
        className="w-full max-w-md p-6"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="change-password-title"
              className="text-lg font-bold text-gray-900"
            >
              Change password
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your current password, then choose a new one.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
            className="rounded-md p-1 text-gray-500 hover:text-gray-900"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <Input
            element="input"
            input_type="password"
            name="currentPassword"
            tag="Current Password"
            value={formValues.currentPassword}
            handler={handleChange}
            placeholder="Enter current password"
          />
          {hasErrors && (
            <p className="text-sm text-red-500">{errors.current}</p>
          )}
          <Input
            element="input"
            input_type="password"
            name="newPassword"
            tag="New Password"
            value={formValues.newPassword}
            handler={handleChange}
            placeholder="Enter new password"
          />
          {hasErrors && <p className="text-sm text-red-500">{errors.next}</p>}
          <Input
            element="input"
            input_type="password"
            name="confirmPassword"
            tag="Confirm Password"
            value={formValues.confirmPassword}
            handler={handleChange}
            placeholder="Confirm password"
          />
          {hasErrors && (
            <p className="text-sm text-red-500">{errors.confirm}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl px-4 py-2 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="py-2! px-4! rounded-xl!"
              primary
            >
              {isPending ? "Saving…" : "Update password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ChangePasswordModal