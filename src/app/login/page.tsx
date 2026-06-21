import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="max-w-sm mx-auto px-4 pt-24 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight text-[#e7e9ea] mb-1">
        Welcome back
      </h1>
      <p className="text-[14px] text-[#8b8d93] mb-7">Log in to your workspace.</p>
      <LoginForm />
      <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-[12px] text-[#536471] leading-relaxed">
        Demo logins:
        <br />
        founder@claudex.dev / claudex-demo-2026
        <br />
        customer@claudex.dev / claudex-demo-2026
      </div>
    </div>
  );
}
