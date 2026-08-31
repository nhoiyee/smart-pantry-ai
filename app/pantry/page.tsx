"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PantryItem = {
  id: string;
  user_id: string;
  item_name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  purchase_date: string | null;
  expiry_date: string | null;
  storage_location: string | null;
  barcode: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;

  // Pantry AI information
  expiry_status?: string;
  days_until_expiry?: number | null;
};

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [recipe, setRecipe] = useState("");
  const [recipeLoading, setRecipeLoading] = useState(false);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    fetchPantryItems();
  }, []);

  // ============================================
  // READ - Fetch Pantry Items
  // ============================================

async function fetchPantryItems() {
  setLoading(true);
  setError("");

  try {
    // Get the current Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("You must be logged in to view your pantry.");
      setLoading(false);
      return;
    }

    // Call the Pantry API with the user's access token
    const response = await fetch("/api/pantry-api", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Failed to retrieve pantry items.");
      setLoading(false);
      return;
    }

    setItems(result.items || []);
  } catch (error) {
    console.error("Pantry API error:", error);
    setError("Failed to connect to the pantry API.");
  }

  setLoading(false);
}

  // ============================================
  // EXPIRY STATUS
  // ============================================

  function getExpiryStatus(expiryDate: string | null) {
    if (!expiryDate) {
      return {
        label: "No Expiry Date",
        className: "text-gray-600",
      };
    }

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const differenceInMs =
      expiry.getTime() - today.getTime();

    const differenceInDays = Math.ceil(
      differenceInMs / (1000 * 60 * 60 * 24)
    );

    if (differenceInDays < 0) {
      return {
        label: "Expired",
        className: "text-red-600",
      };
    }

    if (differenceInDays <= 3) {
      return {
        label: "Expiring Soon",
        className: "text-yellow-600",
      };
    }

    return {
      label: "Fresh",
      className: "text-green-600",
    };
  }

  // ============================================
  // DASHBOARD COUNTS
  // ============================================

  const totalItems = items.length;

  const expiredItems = items.filter(
    (item) =>
      getExpiryStatus(item.expiry_date).label === "Expired"
  ).length;

  const expiringSoonItems = items.filter(
    (item) =>
      getExpiryStatus(item.expiry_date).label ===
      "Expiring Soon"
  ).length;

  const freshItems = items.filter(
    (item) =>
      getExpiryStatus(item.expiry_date).label === "Fresh"
  ).length;

  // ============================================
  // CREATE - Add Pantry Item
  // ============================================

  async function addPantryItem(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!itemName.trim()) {
      setError("Please enter an item name.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to add a pantry item.");
      return;
    }

    const { error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: user.id,
        item_name: itemName.trim(),
        category: category || null,
        quantity: Number(quantity),
        unit: unit || null,
        purchase_date: purchaseDate || null,
        expiry_date: expiryDate || null,
        storage_location: storageLocation || null,
        barcode: barcode || null,
      });

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setMessage("Pantry item added successfully.");

    clearForm();

    await fetchPantryItems();
  }

  // ============================================
  // UPDATE - Start Editing
  // ============================================

  function startEditing(item: PantryItem) {
    setEditingId(item.id);

    setItemName(item.item_name);
    setCategory(item.category || "");
    setQuantity(String(item.quantity));
    setUnit(item.unit || "");
    setPurchaseDate(item.purchase_date || "");
    setExpiryDate(item.expiry_date || "");
    setStorageLocation(item.storage_location || "");
    setBarcode(item.barcode || "");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================
  // Clear Form
  // ============================================

  function clearForm() {
    setEditingId(null);
    setItemName("");
    setCategory("");
    setQuantity("1");
    setUnit("");
    setPurchaseDate("");
    setExpiryDate("");
    setStorageLocation("");
    setBarcode("");
  }

  // ============================================
  // UPDATE - Update Pantry Item
  // ============================================

  async function updatePantryItem(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!editingId) {
      return;
    }

    if (!itemName.trim()) {
      setError("Please enter an item name.");
      return;
    }

    const { error } = await supabase
      .from("pantry_items")
      .update({
        item_name: itemName.trim(),
        category: category || null,
        quantity: Number(quantity),
        unit: unit || null,
        purchase_date: purchaseDate || null,
        expiry_date: expiryDate || null,
        storage_location: storageLocation || null,
        barcode: barcode || null,
      })
      .eq("id", editingId);

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setMessage("Pantry item updated successfully.");

    clearForm();

    await fetchPantryItems();
  }

  // ============================================
  // DELETE - Delete Pantry Item
  // ============================================

  async function deletePantryItem(id: string) {
    setError("");
    setMessage("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this pantry item?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setError(error.message);
      return;
    }

    setMessage("Pantry item deleted successfully.");

    if (editingId === id) {
      clearForm();
    }

    await fetchPantryItems();
  }

// add

async function askPantryAI() {
  console.log("ASK PANTRY AI BUTTON CLICKED");

  if (!aiQuestion.trim()) {
    console.log("STOPPED: aiQuestion is empty");
    setError("Please enter a question for Pantry AI.");
    return;
  }

  console.log("QUESTION:", aiQuestion);

  try {
    setAiLoading(true);
    setAiResponse("");
    setError("");
    setMessage("");

    console.log("CHECKING SUPABASE SESSION...");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);

    if (!session) {
      console.log("STOPPED: NO SESSION");
      setError("You must be logged in to use Pantry AI.");
      return;
    }

    console.log("SENDING REQUEST TO /api/pantry-ai...");

    const response = await fetch("/api/pantry-ai", {
    // const response = await fetch("/api/pantry-ai-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        question: aiQuestion.trim(),
      }),
    });

    console.log("RESPONSE STATUS:", response.status);

    const result = await response.json();

    console.log("API RESULT:", result);

    if (!response.ok) {
      setError(
        result.error ||
          "Unable to get AI recommendations. Please try again."
      );
      return;
    }

    if (!result.recommendation) {
      setError(
        "The AI did not return a recommendation. Please try again."
      );
      return;
    }

    setAiResponse(result.recommendation);
  } catch (error) {
    console.error("Pantry AI error:", error);

    setError(
      "Unable to connect to Pantry AI. Please check your connection and try again."
    );
  } finally {
    setAiLoading(false);
  }
}
 

 


// ==================
// generate Recipe
// ===================

async function generateRecipe() {
  console.log("GENERATE RECIPE BUTTON CLICKED");

  try {
    setRecipeLoading(true);
    setRecipe("");
    setError("");
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("You must be logged in to generate a recipe.");
      return;
    }

    const response = await fetch("/api/pantry-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    console.log("RECIPE API RESULT:", result);

    if (!response.ok) {
      setError(result.error || "Recipe generation failed.");
      return;
    }

    setRecipe(result.recipe || "No recipe was generated.");
  } catch (error) {
    console.error("Recipe generation error:", error);
    setError("Failed to connect to the recipe generator.");
  } finally {
    setRecipeLoading(false);
  }
}


  // ============================================
  // PAGE UI
  // ============================================

  return (
    <main className="min-h-screen p-8">
      {/* PAGE HEADING */}
      <h1 className="text-3xl font-bold">
        My Smart Pantry
      </h1>

      <p className="mt-2 text-gray-600">
        Manage your pantry items and track their expiry dates.
      </p>

      {/* ========================================
          PANTRY DASHBOARD
          ======================================== */}

      {!loading && !error && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Total */}
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Items
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalItems}
            </p>
          </div>

          {/* Fresh */}
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Fresh
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {freshItems}
            </p>
          </div>

          {/* Expiring Soon */}
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Expiring Soon
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {expiringSoonItems}
            </p>
          </div>

          {/* Expired */}
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Expired
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {expiredItems}
            </p>
          </div>
        </section>
      )}

      {/* ========================================
          PANTRY AI ASSISTANT
          ======================================== */}

      <section className="mt-8 max-w-3xl rounded-lg border p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">
          Pantry AI Assistant
        </h2>

        <p className="mt-2 text-gray-600">
          Ask questions about your pantry, expiry dates, or meal ideas.
        </p>

        <textarea
          value={aiQuestion}
          onChange={(e) => setAiQuestion(e.target.value)}
          placeholder="e.g. What can I cook with the items in my pantry?"
          className="mt-4 w-full rounded border p-3"
          rows={4}
        />

        <button
          type="button"
          onClick={askPantryAI}
          disabled={aiLoading}
          className="mt-3 rounded bg-black px-5 py-2 text-white hover:opacity-80 disabled:opacity-50"
        >
          
          {aiLoading ? "Thinking..." : "Ask Pantry AI"}
        </button>

        <button
          type="button"
          onClick={generateRecipe}
          disabled={recipeLoading}
          className="mt-3 ml-3 rounded border px-5 py-2 hover:bg-gray-100 disabled:opacity-50"
        >
          {recipeLoading ? "Generating Recipe..." : "Generate Recipe"}
        </button>

        {aiResponse && (
          <div className="mt-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="font-semibold">
              Pantry AI Response
            </h3>

            <p className="mt-2 whitespace-pre-wrap">
              {aiResponse}
            </p>
          </div>
        )}


        {recipe && (
            <div className="mt-6 rounded-lg border bg-gray-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  🍳 AI-Generated Recipe
                </h3>

              <button
                type="button"
                onClick={() => setRecipe("")}
                className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
              >
                Clear
              </button>
              </div>

            <div className="mt-4 rounded-lg border bg-white p-5">
                <p className="whitespace-pre-wrap leading-7 text-gray-700">
                  {recipe}
                </p>
            </div>
          </div>
        )}
  
      </section>

      {/* ========================================
          ADD / EDIT FORM
          ======================================== */}

      <section className="mt-8 max-w-2xl rounded-lg border p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">
          {editingId
            ? "Edit Pantry Item"
            : "Add Pantry Item"}
        </h2>

        <form
          onSubmit={
            editingId
              ? updatePantryItem
              : addPantryItem
          }
          className="mt-4 space-y-4"
        >
          {/* Item Name */}
          <div>
            <label className="block font-medium">
              Item Name
            </label>

            <input
              type="text"
              value={itemName}
              onChange={(e) =>
                setItemName(e.target.value)
              }
              placeholder="e.g. Milk"
              className="mt-1 w-full rounded border p-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="e.g. Dairy"
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-medium">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block font-medium">
              Unit
            </label>

            <input
              type="text"
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value)
              }
              placeholder="e.g. bottles, kg, pcs"
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block font-medium">
              Purchase Date
            </label>

            <input
              type="date"
              value={purchaseDate}
              onChange={(e) =>
                setPurchaseDate(e.target.value)
              }
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block font-medium">
              Expiry Date
            </label>

            <input
              type="date"
              value={expiryDate}
              onChange={(e) =>
                setExpiryDate(e.target.value)
              }
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Storage Location */}
          <div>
            <label className="block font-medium">
              Storage Location
            </label>

            <input
              type="text"
              value={storageLocation}
              onChange={(e) =>
                setStorageLocation(e.target.value)
              }
              placeholder="e.g. Refrigerator"
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block font-medium">
              Barcode
            </label>

            <input
              type="text"
              value={barcode}
              onChange={(e) =>
                setBarcode(e.target.value)
              }
              placeholder="Optional"
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded bg-black px-5 py-2 text-white hover:opacity-80"
            >
              {editingId
                ? "Update Pantry Item"
                : "Add Pantry Item"}
            </button>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded bg-black px-5 py-2 text-white hover:opacity-80"
            >
              {editingId
                ? "Update Pantry Item"
                : "Add Pantry Item"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  setError("");
                  setMessage("");
                }}
                className="rounded border px-5 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  clearForm();
                  setError("");
                  setMessage("");
                }}
                className="rounded border px-5 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Messages */}
        {message && (
          <p className="mt-4 text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}
      </section>

      {/* ========================================
          PANTRY ITEMS
          ======================================== */}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">
          Your Pantry
        </h2>

        {loading && (
          <p className="mt-4">
            Loading pantry items...
          </p>
        )}

        {!loading &&
          !error &&
          items.length === 0 && (
            <p className="mt-4">
              Your pantry is empty.
            </p>
          )}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const expiryStatus =
                  getExpiryStatus(item.expiry_date);

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold">
                      {item.item_name}
                    </h3>

                    <p className="mt-2">
                      Category:{" "}
                      {item.category ||
                        "Not specified"}
                    </p>

                    <p>
                      Quantity: {item.quantity}{" "}
                      {item.unit || ""}
                    </p>

                    <p>
                      Purchase Date:{" "}
                      {item.purchase_date ||
                        "Not specified"}
                    </p>

                    <p>
                      Expiry:{" "}
                      {item.expiry_date ||
                        "No expiry date"}
                    </p>

                    <p
                      className={`font-semibold ${expiryStatus.className}`}
                    >
                      Status:{" "}
                      {expiryStatus.label}
                    </p>

                    <p>
                      Storage:{" "}
                      {item.storage_location ||
                        "Not specified"}
                    </p>

                    {item.barcode && (
                      <p>
                        Barcode: {item.barcode}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(item)
                        }
                        className="rounded border px-4 py-2 hover:bg-gray-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deletePantryItem(item.id)
                        }
                        className="rounded border px-4 py-2 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}