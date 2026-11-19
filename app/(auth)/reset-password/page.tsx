"use client"

import { useChangePassword } from "@/api/auth";
import { Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { deleteCrossSubdomainCookie, getCrossSubdomainCookie, setCrossSubdomainCookie } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {}

type Values = {
  token: string,
  newPassword: string,
  confirmPassword: string
}

const defaultValues: Values = {
  token: "",
  newPassword: "",
  confirmPassword: "",
};

const RESET_TOKEN_KEY = "reset_password_token";

const ResetPassword = (props: Props) => {
  const [formValues, setFormValues] = useState<Values>(defaultValues);
  const { mutateAsync: changePassword, isPending: isChangePending, error: changeError } = useChangePassword();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const urlToken = searchParams.get("token");

    if (urlToken) {
      sessionStorage.setItem(RESET_TOKEN_KEY, urlToken);
      setFormValues((prev) => ({ ...prev, token: urlToken }));
      router.replace(pathname);
      return;
    }

    const stored = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (stored) {
      setFormValues((prev) => ({ ...prev, token: stored }));
    }
  }, [searchParams, pathname, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormValues((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formValues;

    if(!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    } else {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      } else {
        try {
          const res = await changePassword(formValues);
          if(res.status == 200 || res.status == 201) {
            toast.success(`Password changed successfully`, {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            sessionStorage.removeItem(RESET_TOKEN_KEY);
            deleteCrossSubdomainCookie('reset_identifier');
            router.push("/login");
          }
        } catch (error) {
          toast.error("Failed to reset password");
        }
      }
    }
  }
  
  return (
    <div className="h-screen flex flex-col justify-center items-center px-6">
      <Card className="w-full md:w-150 md:p-12!">
        <form onSubmit={handleSubmit}>
          <div className="my-4">
            <h1 className="text-3xl">Reset Password</h1>
            <p className="text-(--text-muted)">
              Token has been sent to { getCrossSubdomainCookie('reset_identifier') }
            </p>
          </div>
          <Input
            input_type="password"
            element="input"
            placeholder="Enter new password"
            tag="New Password"
            name="newPassword"
            value={formValues.newPassword}
            handler={handleChange}
            required
          />
          <Input
            input_type="password"
            element="input"
            placeholder="Confirm password"
            tag="Confirm Password"
            name="confirmPassword"
            value={formValues.confirmPassword}
            handler={handleChange}
            required
          />
          <Button type="submit" isFullWidth primary isLoading={isChangePending}>
            {isChangePending ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ResetPassword