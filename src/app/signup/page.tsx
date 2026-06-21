import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SignupForm from "@/components/auth/SignupForm";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="max-w-sm mx-auto px-4 pt-24 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea] mb-1">
        Create your account
      </h1>
      <p className="text-[14px] text-[#8b8d93] mb-7">
        Start shipping in under a minute.
      </p>
      <SignupForm />
    </div>
  );
}
