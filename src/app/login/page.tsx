import LoginContainer from "@/components/auth/login-container";

export const metadata = {
  title: "Login - ModerateAI",
  description: "Sign in to your ModerateAI account",
};

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-background">
      <LoginContainer />
    </div>
  );
}
