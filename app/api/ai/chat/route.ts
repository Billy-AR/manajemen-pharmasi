import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";

const DEFAULT_MODEL = "gemini-1.5-flash-latest";
const apiKey = process.env.GEMINI_API_KEY || "";
const rawModel = process.env.GEMINI_MODEL?.trim();
const modelName =
  rawModel === "gemini-pro"
    ? "gemini-1.5-pro-latest" // map legacy name to the current supported model
    : rawModel || DEFAULT_MODEL;

if (!apiKey) {
  console.warn("[AI Chat] GEMINI_API_KEY is missing. Set it in .env.local");
}

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY belum dikonfigurasi di server (.env.local)" }, { status: 500 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get medicine context from Firestore (guard against incomplete data)
    const medicinesSnapshot = await adminDb.collection("medicines").get();
    const medicines = medicinesSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const price = typeof data.price === "number" ? data.price : Number(data.price ?? 0);
      const stock = typeof data.stock === "number" ? data.stock : Number(data.stock ?? 0);
      const unit = typeof data.unit === "string" && data.unit ? data.unit : "unit";
      const category = typeof data.category === "string" && data.category ? data.category : "-";
      const expiryRaw = (data as any).expiryDate ?? (data as any).expiredAt;
      const expiryDate =
        typeof expiryRaw === "number"
          ? new Date(expiryRaw).toLocaleDateString("id-ID")
          : typeof expiryRaw === "string" && expiryRaw
            ? expiryRaw
            : "Tidak tercatat";

      return {
        name: (data.name as string) ?? "Obat tanpa nama",
        category,
        stock,
        price,
        unit,
        expiryDate,
      };
    });

    // Build context for AI
    const context = `Kamu adalah asisten apoteker yang membantu kasir dan admin apotek.
Kamu punya akses ke database obat berikut:

${medicines
  .map(
    (med) =>
      `- ${med.name} (Kategori: ${med.category}, Stok: ${med.stock} ${med.unit}, Harga: Rp ${med.price.toLocaleString(
        "id-ID",
      )}, Kadaluarsa: ${med.expiryDate})`,
  )
  .join("\n")}

Tugas kamu:
1. Jawab pertanyaan tentang obat, stok, harga, kategori
2. Berikan rekomendasi obat berdasarkan keluhan
3. Ingatkan tentang dosis umum (tapi selalu sarankan konsultasi dokter)
4. Jawab dalam bahasa Indonesia yang ramah dan profesional
5. Jika obat tidak ada di database, katakan tidak tersedia

Pertanyaan user: ${message}`;

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(context);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Maaf, AI sedang tidak tersedia.";

    // Give a more actionable error if model name is not recognized by the API
    const isModelNotFound =
      errorMessage.includes("404") || errorMessage.toLowerCase().includes("model") && errorMessage.toLowerCase().includes("not");
    const hint = isModelNotFound
      ? "Model tidak ditemukan. Coba set GEMINI_MODEL=gemini-1.5-flash-latest di .env.local lalu restart server."
      : undefined;

    const errMessage = hint ? `${errorMessage}. ${hint}` : errorMessage;
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
