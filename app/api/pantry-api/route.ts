import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    // Get the access token from the request
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Missing authorization token." },
        { status: 401 }
      );
    }

    // Create a Supabase client using the user's access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      }
    );

    // Verify the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    // Retrieve only this user's pantry items
    const { data: items, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", user.id)
      .order("expiry_date", { ascending: true });

    if (error) {
      console.error("Pantry API database error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: items || [],
    });
  } catch (error) {
    console.error("Pantry API error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve pantry items." },
      { status: 500 }
    );
  }
}