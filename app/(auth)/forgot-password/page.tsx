"use client";
import { useResetPassword } from '@/api/auth';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { setCrossSubdomainCookie } from '@/lib/utils';
import { getIdentifierType } from '@/lib/validateIdentifier';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react'
import { toast } from 'react-toastify';

type Props = {}

const ForgotPassword = (props: Props) => {
  const [identifier, setIdentifier] = useState("");
  const { mutateAsync: resetPassword, isPending: isResetPending, error: resetError } = useResetPassword();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formIdentifier = identifier.trim();

    const identifierType = getIdentifierType(formIdentifier);
    if (!identifierType) {
      toast.error("Enter a valid email address or phone number");
      return;
    }
    try {
      const res = await resetPassword(formIdentifier);

      if(res.status == 200 || res.status == 201) {
        toast.success(`Message sent to ${identifier}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setCrossSubdomainCookie("reset_identifier", identifier, 1);

        if(identifierType == 'phone') {
          router.replace('/forgot-password/phone');
        }
      } else {
        toast.error(`Something went wrong: ${res.data.message}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message ??
          err.message ??
          "Something went wrong, please try again",
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      );
    }
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center px-6">
      <Card className="w-full md:w-150 md:p-12!">
        <form onSubmit={handleSubmit}>
          <div className="my-4">
            <h1 className="text-3xl">Forgot Password</h1>
            <p className="text-(--text-muted)">
              An message with a password reset link will be sent to your email address or phone number
            </p>
          </div>
          <Input
            input_type="text"
            element="input"
            placeholder="Enter your email or phone number"
            tag="Email or Phone Number"
            name="identifier"
            value={identifier || ""}
            handler={(e) => setIdentifier(e.target.value)}
            required
          />
          <Button type="submit" isFullWidth primary isLoading={isResetPending}>
            {isResetPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ForgotPassword