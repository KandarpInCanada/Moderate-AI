"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profileUrl: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  profileUrl: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Extract profile picture URL from user metadata
        if (initialSession?.user?.user_metadata?.avatar_url) {
          setProfileUrl(initialSession.user.user_metadata.avatar_url);
        } else if (initialSession?.user?.user_metadata?.picture) {
          setProfileUrl(initialSession.user.user_metadata.picture);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Extract profile picture URL from user metadata
      if (session?.user?.user_metadata?.avatar_url) {
        setProfileUrl(session.user.user_metadata.avatar_url);
      } else if (session?.user?.user_metadata?.picture) {
        setProfileUrl(session.user.user_metadata.picture);
      } else {
        setProfileUrl(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, user, loading, profileUrl, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
