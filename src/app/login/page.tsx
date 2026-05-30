import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <LoginForm />
      <p className="mt-4 text-sm text-[rgba(244,244,245,0.40)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#38BDF8] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
