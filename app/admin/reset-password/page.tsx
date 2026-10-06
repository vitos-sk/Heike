import { Suspense } from "react";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const metadata = { title: "Neues Passwort" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
