import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <SignupForm />
      <p className="mt-4 text-sm text-[rgba(244,244,245,0.40)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#38BDF8] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
