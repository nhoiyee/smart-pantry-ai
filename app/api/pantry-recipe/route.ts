import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get the user's access token
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    // Create Supabase client using the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // Verify the logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's pantry items
    const { data: pantryItems, error: pantryError } = await supabase
      .from("pantry_items")
      .select("item_name, quantity, unit, expiry_date")
      .eq("user_id", user.id);

    if (pantryError) {
      console.error("Pantry error:", pantryError);

      return NextResponse.json(
        { error: "Failed to retrieve pantry items" },
        { status: 500 }
      );
    }

    if (!pantryItems || pantryItems.length === 0) {
      return NextResponse.json(
        { error: "Your pantry is empty. Add some ingredients first." },
        { status: 400 }
      );
    }

    // Get today's date using Singapore time
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Singapore",
    });

    // Separate expired and usable items
    const expiredItems = pantryItems.filter(
      (item) =>
        item.expiry_date &&
        item.expiry_date < today
    );

    const usableItems = pantryItems.filter(
      (item) =>
        !item.expiry_date ||
        item.expiry_date >= today
    );

    // If every item is expired, do not generate a recipe
    if (usableItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "All items in your pantry are expired. No recipe can be safely generated. Please add some non-expired ingredients first.",
        },
        { status: 400 }
      );
    }

    // Prepare ONLY non-expired pantry information for the AI
    const pantryText = usableItems
      .map(
        (item) =>
          `${item.item_name} - ${item.quantity} ${
            item.unit || ""
          } - expiry: ${
            item.expiry_date || "No expiry date"
          }`
      )
      .join("\n");

    // Generate recipe using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            `You are a helpful and safety-conscious cooking assistant.

Today's date is ${today}.

IMPORTANT FOOD SAFETY RULES:
1. NEVER recommend consuming an expired food item.
2. NEVER use an expired food item as a recipe ingredient.
3. NEVER list an expired food item under Pantry Ingredients.
4. Only use the non-expired pantry items provided below as pantry ingredients.
5. Items with an expiry date earlier than today's date are expired and must not be used.
6. Prioritize non-expired ingredients that are expiring soon.
7. If an ingredient normally required for the recipe is not available as a non-expired pantry item, list it under Additional Ingredients instead.
8. Do not claim that an expired item is fresh, safe, or suitable for cooking.
9. Generate one practical recipe based on the user's currently usable pantry items.
10. Clearly separate Pantry Ingredients from Additional Ingredients.

NON-EXPIRED PANTRY ITEMS:
${pantryText}`,
        },
        {
          role: "user",
          content: `Create one practical recipe using the following non-expired pantry items:

${pantryText}

Return the recipe using this format:

Recipe Name:
Preparation Time:
Cooking Time:
Servings:

Pantry Ingredients:
- ingredient

Additional Ingredients:
- ingredient

Instructions:
1. Step
2. Step
3. Step

Also provide a short explanation of why this recipe is suitable for the user's pantry.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const recipe = response.choices[0]?.message?.content?.trim();

    if (!recipe) {
      return NextResponse.json(
        { error: "No recipe was generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("Recipe AI error:", error);

    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}