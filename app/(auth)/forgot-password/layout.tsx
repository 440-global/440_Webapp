import { Suspense } from "react";

export const metadata = {
  title: "Forgot Password",
};

const ForgotPasswordLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={null}>{ children }</Suspense>;
};

export default ForgotPasswordLayout;
