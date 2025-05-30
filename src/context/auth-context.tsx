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

  const extractProfilePicture = (userData: User | null) => {
    if (!userData) return null;

    // Try all possible paths where Google might store the profile picture
    const possiblePaths = [
      userData.user_metadata?.avatar_url,
      userData.user_metadata?.picture,
      userData.user_metadata?.user_picture,
      userData.user_metadata?.picture_url,
      userData.user_metadata?.profile_picture,
      // For Google OAuth specifically
      userData.user_metadata?.picture,
      // Nested paths that Google sometimes uses
      userData.user_metadata?.identity_data?.avatar_url,
      userData.user_metadata?.identity_data?.picture,
      // Raw provider data sometimes contains the picture
      userData.app_metadata?.provider === "google" &&
        userData.user_metadata?.raw_user_meta_data?.picture,
    ].find((path) => path);

    return possiblePaths || null;
  };

  // Store user details in DynamoDB
  const storeUserDetails = async (userData: User, accessToken: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          // Any additional user details can be added here
          LastLoginTimestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error("Failed to store user details:", await response.text());
      }
    } catch (error) {
      console.error("Error storing user details:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Extract profile picture URL
        if (initialSession?.user) {
          const pictureUrl = extractProfilePicture(initialSession.user);
          setProfileUrl(pictureUrl);

          // Store user details in DynamoDB when session is initialized
          if (initialSession.access_token) {
            await storeUserDetails(
              initialSession.user,
              initialSession.access_token
            );
          }
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Extract profile picture URL
      if (session?.user) {
        const pictureUrl = extractProfilePicture(session.user);
        setProfileUrl(pictureUrl);

        // Store user details in DynamoDB when auth state changes
        if (session.access_token) {
          await storeUserDetails(session.user, session.access_token);
        }
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
      // Do NOT specify a redirectTo - let Supabase handle the redirect flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Remove redirectTo to use Supabase's default flow
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Error initiating Google sign-in:", error);
      } else {
        // Let the browser handle the redirect
      }
    } catch (error) {
      console.error("Exception during Google sign-in:", error);
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
