export default function AuthErrorPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-6">
          There was a problem authenticating your account. Please try again or
          contact support if the issue persists.
        </p>
        <a
          href="/"
          className="block w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-center font-medium"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
