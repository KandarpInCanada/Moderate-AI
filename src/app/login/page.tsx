import LoginContainer from "@/components/auth/login-container";

export const metadata = {
  title: "Login - ModerateAI",
  description: "Sign in to your ModerateAI account",
};

// Use a client component pattern instead of trying to use searchParams in a server component
export default function LoginPage() {
  return (
    <div className="flex h-screen bg-background">
      <LoginContainer />
    </div>
  );
}
