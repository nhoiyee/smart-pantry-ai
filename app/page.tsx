"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  full_name: string | null;
};

export default function HomePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      // Get currently authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");

      // Get user's profile
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile error:", error.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow">
        <h1 className="text-xl font-bold">Smart Pantry AI</h1>

        <button
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <section className="p-8">
        <h2 className="mb-2 text-2xl font-bold">
          Welcome, {profile?.full_name || "User"}!
        </h2>

        <p className="text-gray-600">
          Logged in as: {userEmail}
        </p>
      </section>
    </main>
  );
}