import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get the access token from the request
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Missing authorization token. Please log in again." },
        { status: 401 }
      );
    }

    // Safely read the request body
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    // Get the user's question
    const userQuestion =
      typeof body.question === "string" ? body.question.trim() : "";

    if (!userQuestion) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    // Create Supabase client using the user's access token
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
      console.error("Authentication error:", userError);

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
      console.error("Pantry database error:", error);

      return NextResponse.json(
        {
          error:
            "Unable to load your pantry data. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Check whether the user has pantry items
    if (!items || items.length === 0) {
      return NextResponse.json({
        recommendation:
          "Your pantry is currently empty. Add some pantry items so I can provide recommendations.",
        items: [],
      });
    }

    // Get today's date in Singapore (YYYY-MM-DD)
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    // Separate expired and usable pantry items
    const expiredItems = items.filter(
      (item) =>
        item.expiry_date &&
        item.expiry_date < today
    );

    const usableItems = items.filter(
      (item) =>
        !item.expiry_date ||
        item.expiry_date >= today
    );

    // Prepare usable pantry information for the AI
    const pantryText = usableItems.length
      ? usableItems
          .map(
            (item) =>
              `Item: ${item.item_name}, Quantity: ${item.quantity}, Unit: ${
                item.unit || "not specified"
              }, Expiry Date: ${item.expiry_date || "no expiry date"}`
          )
          .join("\n")
      : "No non-expired pantry items are currently available.";

    // Prepare expired item information separately
    const expiredText = expiredItems.length
      ? expiredItems
          .map(
            (item) =>
              `Item: ${item.item_name}, Expired on: ${item.expiry_date}`
          )
          .join("\n")
      : "No expired pantry items.";

    // Ask OpenAI to answer the user's specific question
    let completion;

    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              `You are a Smart Pantry AI assistant.

Use ONLY the pantry information provided below as the user's current pantry.

IMPORTANT FOOD SAFETY RULES:
1. NEVER recommend consuming, cooking with, or using an EXPIRED food item.
2. An item is EXPIRED when its expiry date is earlier than today's date.
3. Expired items are provided separately and MUST NOT be used as recipe ingredients or alternatives.
4. If the user specifically asks about an expired item, clearly tell them that it is expired and should not be recommended for consumption.
5. Do not describe an expired item as fresh, safe, usable, or suitable for cooking.
6. If a recipe or recommendation would normally use an expired item, replace it with a non-expired pantry item if an appropriate alternative exists.
7. If no safe pantry alternative exists, clearly say that the required ingredient is not safely available in the pantry.
8. Prioritize items that are approaching their expiry date, but NEVER prioritize expired items.
9. Only recommend items that actually exist in the user's pantry.
10. If the user asks about an item that does NOT exist in the pantry, clearly tell the user that it is not currently listed.
11. Consider quantities and units when relevant.
12. Keep recommendations practical, concise, and easy to understand.

Today's date:
${today}

NON-EXPIRED / USABLE PANTRY ITEMS:
${pantryText}

EXPIRED PANTRY ITEMS — DO NOT RECOMMEND FOR CONSUMPTION:
${expiredText}`,
          },
          {
            role: "user",
            content: userQuestion,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });
    } catch (openAIError) {
      console.error("OpenAI API error:", openAIError);

      return NextResponse.json(
        {
          error:
            "The AI service is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }


// Safely retrieve the AI response
const recommendation =
  completion.choices[0]?.message?.content?.trim();

// Final safety check: prevent expired pantry items from being
// recommended even if the AI accidentally mentions them.
const recommendationLower = recommendation?.toLowerCase() || "";

const unsafeExpiredItem = expiredItems.find((item) => {
  const itemName = String(item.item_name || "").trim().toLowerCase();

  if (!itemName) return false;

  return (
    recommendationLower.includes(itemName) &&
    (
      recommendationLower.includes("eat") ||
      recommendationLower.includes("cook") ||
      recommendationLower.includes("use") ||
      recommendationLower.includes("make") ||
      recommendationLower.includes("prepare") ||
      recommendationLower.includes("ingredient") ||
      recommendationLower.includes("recipe")
    )
  );
});

if (unsafeExpiredItem) {
  console.warn(
    "Blocked AI recommendation involving expired item:",
    unsafeExpiredItem.item_name
  );

  return NextResponse.json({
    recommendation:
      `I can't recommend using ${unsafeExpiredItem.item_name} because it is expired. Please discard it and choose a non-expired pantry item instead.`,
    items,
  });
}

// Check whether the AI returned an empty response
if (!recommendation) {
  console.error("OpenAI returned an empty response.");

  return NextResponse.json(
    {
      error:
        "The AI could not generate a recommendation. Please try again.",
    },
    { status: 502 }
  );
}

    // Return successful response
    return NextResponse.json({
      recommendation,
      items,
    });
  } catch (error) {
    console.error("Unexpected Pantry AI error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}