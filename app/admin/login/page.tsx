import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Anmelden" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
