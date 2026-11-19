"use client";

import { useResetPassword, useResetPasswordWithPhone } from "@/api/auth";
import { Button, Card, Input, OtpSlot } from "@/components/ui";
import { useNestedForm } from "@/hooks/use-nested-form";
import {
  deleteCrossSubdomainCookie,
  getCrossSubdomainCookie,
} from "@/lib/utils";
import { PhoneResetPayload } from "@/types/types";
import { AxiosError } from "axios";
import { OTPInput, REGEXP_ONLY_DIGITS, SlotProps } from "input-otp";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {};

const defaultValues: PhoneResetPayload = {
  phone: "",
  otp: "",
  password: "",
  confirmPassword: "",
};

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

const ForgotPasswordPhone = (props: Props) => {
  const { formValues, setFormValues, handleChange } =
    useNestedForm<PhoneResetPayload>(defaultValues);
  const [step, setStep] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const {
    mutateAsync: resetPassword,
    isPending,
    error,
  } = useResetPasswordWithPhone();
  const { mutateAsync: resend, isPending: isResending, error: resetError } = useResetPassword();
  const [identifier, setIdentifier] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const id = getCrossSubdomainCookie("reset_identifier");
    if (!id) {
      router.replace("/forgot-password");
      return;
    }
    setIdentifier(id);
    setFormValues((prev) => ({ ...prev, phone: id }));
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || !identifier) return;
    try {
      await resend(identifier);
      setFormValues((prev) => ({ ...prev, otp: "" }));
      setSecondsLeft(RESEND_SECONDS);
      toast.success("OTP sent");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message ?? err.message ?? "Could not resend OTP",
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { password, confirmPassword } = formValues;

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    } else {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      } else {
        try {
          const res = await resetPassword(formValues);
          if (res.status == 200 || res.status == 201) {
            toast.success(`Password changed successfully`, {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            deleteCrossSubdomainCookie("reset_identifier");
            router.push("/login");
          }
        } catch (error) {
          const err = error as AxiosError<{ message?: string }>;
          toast.error(
            // @ts-ignore
            err.response?.data?.errors[0]?.message ??
            err.response?.data?.message ??
              err.message ??
              "Something went wrong, please try again",
          );
        }
      }
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center px-6">
      <Card className="w-full md:w-150 md:p-12!">
        <form onSubmit={handleSubmit}>
          {step == 1 && (
            <>
              <div className="my-4">
                <h1 className="text-2xl">Enter OTP</h1>
                <p className="text-(--text-muted)">
                  Enter the OTP sent to {identifier} to reset your password.
                </p>
              </div>
              <div className="my-6 flex justify-center">
                <OTPInput
                  maxLength={OTP_LENGTH}
                  value={formValues.otp}
                  onChange={(otp) =>
                    setFormValues((prev) => ({ ...prev, otp }))
                  }
                  pattern={REGEXP_ONLY_DIGITS}
                  autoFocus
                  containerClassName="flex items-center gap-2"
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, i) => (
                        <OtpSlot key={i} {...slot} />
                      ))}
                    </div>
                  )}
                />
              </div>
              <p className="flex gap-1 justify-center items-center text-center text-sm text-(--text-muted) mb-4">
                Didn't get the code?{" "}
                {secondsLeft > 0 ? (
                  <span>Resend in {secondsLeft}s</span>
                ) : (
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-(--primary)! underline disabled:opacity-50 bg-transparent py-0 px-0"
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Button>
                )}
              </p>
              <Button
                primary
                className="justify-self-end"
                onClick={() => setStep(2)}
                disabled={formValues.otp.length < OTP_LENGTH}
              >
                Next
              </Button>
            </>
          )}

          {step == 2 && (
            <>
              <div className="my-4">
                <h2 className="text-2xl">Reset Password</h2>
                <p className="text-(--text-muted)">
                  Enter your new password and confirm it to reset your password.
                </p>
              </div>
              <Input
                input_type="password"
                element="input"
                placeholder="Enter your new password"
                tag="New Password"
                name="password"
                value={formValues.password}
                handler={handleChange}
                required
              />
              <Input
                input_type="password"
                element="input"
                placeholder="Confirm your new password"
                tag="Confirm Password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                genStyle="mt-3! mb-0!"
                handler={handleChange}
                required
              />
              {formValues.confirmPassword !== formValues.password && (
                <p className="text-red-500 text-sm my-2">
                  Passwords don't match
                </p>
              )}
              <div className="flex gap-2 items-center mt-4">
                <Button
                  className="justify-self-end bg-gray-600 text-white"
                  onClick={() => setStep(1)}
                >
                  Previous
                </Button>
                <Button type="submit" isFullWidth primary isLoading={isPending}>
                  {isPending ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPhone;
