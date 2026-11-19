import { Suspense } from "react";
import { RiLoader5Fill } from "react-icons/ri";

export const metadata = {
  title: "Reset Password",
};

const ResetLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center flex-col">
          <RiLoader5Fill size={48} className="text-(--primary) animate-spin" />
          Loading page...
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default ResetLayout;
