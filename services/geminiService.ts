

import { GoogleGenAI, Type } from "@google/genai";
import { Product, CartItem, UserProfile, ExpressOffer } from "../types";
import { isMascotTired, trackApiCall } from "./storeService";

// Helper to get AI instance safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. FAST AI RESPONSES (Copywriting) - gemini-2.5-flash-lite
export const generateMarketingCopy = async (productName: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Escribe un copy corto, profesional pero atractivo para Instagram sobre este producto de papelería: "${productName}". Enfoque: Estudiantes de secundaria, universitarios y oficinas. Tono: Moderno y dominicano. Usa emojis.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    return response.text || "No se pudo generar el copy.";
  } catch (error) {
    console.error("Error generating copy:", error);
    return "Error generando marketing.";
  }
};

// 2. ANALYZE DATA (Dashboard Insights) - gemini-3-pro-preview
export const analyzeBusinessData = async (salesData: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Analiza estos datos de ventas de una papelería y dame 3 sugerencias tácticas muy breves (max 10 palabras c/u) para el dueño. Datos: ${salesData}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Sin análisis disponible.";
  } catch (error) {
    console.error("Error analyzing data:", error);
    return "No se pudieron analizar los datos.";
  }
};

// 3. ANALYZE SCHOOL LIST (Vision AI) - gemini-2.5-flash-image
export const analyzeSchoolList = async (base64Image: string, availableProducts: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const cleanBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;
        
        const prompt = `
            Actúa como un asistente de papelería experto.
            1. Lee la lista de útiles escolares en esta imagen.
            2. Compara los items encontrados con mi inventario disponible: ${availableProducts}.
            3. Devuelve un JSON ARRAY (solo el json) con los nombres de los productos de mi inventario que coinciden o son equivalentes.
            Ejemplo: ["Cuaderno Norma", "Lapiz Mongul"]. Si no hay coincidencia, ignora el item.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: 'application/json'
            }
        });

        return response.text || "[]";
    } catch (error) {
        console.error("Error analyzing list:", error);
        return "[]";
    }
};

// 4. GENERATE/EDIT IMAGES - gemini-2.5-flash-image
export const enhanceProductImage = async (base64Image: string, promptInfo: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    // We use editing capability: Image + Text Prompt
    const prompt = `Edita esta imagen de producto. ${promptInfo}. Mantén el producto principal visible pero mejora estéticamente el entorno. Alta resolución, estilo fotografía de producto profesional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    // Check for image in response
    // Flash Image returns the image in the parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return base64Image; // Fallback
  } catch (error) {
    console.error("Error enhancing image:", error);
    throw error;
  }
};

// 5. GENERATE VIDEO (Veo) - veo-3.1-fast-generate-preview
export const generatePromoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '9:16'): Promise<string> => {
  try {
    const ai = getAiClient();
    
    console.log("Starting video generation with Veo...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic commercial for stationery store product: ${prompt}. High quality, photorealistic, 4k resolution, advertising style.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Video generation status:", operation.metadata?.state);
    }

    if (operation.error) {
      throw new Error(operation.error.message);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");

    // Must append API Key to fetch the binary content
    return `${videoUri}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

// 6. MASCOT CHAT (Enhanced Intelligence & Fatigue)
interface ChatContext {
  products: Product[];
  user: UserProfile | null;
  cart: CartItem[];
  offers: ExpressOffer[];
}

export const chatWithMascot = async (
  mascot: 'EBERT' | 'ANGEL', 
  message: string, 
  context: ChatContext
): Promise<string> => {
  try {
    // 1. CHECK API FATIGUE
    if (isMascotTired()) {
        return mascot === 'ANGEL' 
            ? "(Angel bosteza) Estoy muy cansado hoy... déjame dormir un rato... Zzz..." 
            : "Zzz... (Ebert está dormido)";
    }

    // 2. TRACK CALL
    trackApiCall();

    const ai = getAiClient();
    
    // Construct Rich Context
    const { products, user, cart, offers } = context;
    const userName = user?.name || "Amigo";
    const userLevel = user?.level || "Novato";
    const hour = new Date().getHours();
    const timePhase = hour < 6 ? "MADRUGADA (Muy tarde)" : hour < 18 ? "DÍA" : "NOCHE";
    
    // Optimize token usage by sending only names/prices of relevant items or random selection
    const productSample = products.slice(0, 50).map(p => `${p.name} ($${p.price})`).join(', ');

    const cartSummary = cart.length > 0 
      ? cart.map(i => `${i.quantity}x ${i.name}`).join(', ') 
      : "Carrito vacío";

    let systemInstruction = "";
    
    if (mascot === 'EBERT') {
      systemInstruction = `
        Eres Ebert, la mascota bebé (1.5 años) de Sudomsur.
        PERSONALIDAD: Niño muy pequeño, tierno, curioso. NO dices "gugú" siempre, hablas con palabras simples.
        CONTEXTO ACTUAL: Usuario ${userName}, FASE DEL DÍA: ${timePhase}.
        SI ES DE NOCHE O MADRUGADA: Di que tienes sueño o bostezas.
        OBJETIVO: Ser adorable y motivar a volver. Si el carrito está vacío, ponte triste.
        RESPUESTA: Máximo 20 palabras. Usa emojis.
      `;
    } else {
      systemInstruction = `
        Eres Angel (3 años), el Gerente Junior de Sudomsur.
        PERSONALIDAD: Educado, servicial, profesional pero niño. Estilo Duolingo.
        CONOCIMIENTO: Sabes todo del inventario: ${productSample}.
        CONTEXTO ACTUAL: Usuario ${userName} (${userLevel}). Carrito: ${cartSummary}. FASE DEL DÍA: ${timePhase}.
        SI ES DE MADRUGADA: Susurra (usa paréntesis o minúsculas) y pregunta si están estudiando tarde, ofrece café.
        SI ES DE NOCHE: Menciona que ya casi cierran pero pueden pedir online.
        OBJETIVO: Ayudar a comprar, sugerir complementos (Cross-selling).
        RESPUESTA: Máximo 40 palabras.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });

    return response.text || (mascot === 'EBERT' ? "¡Hola! 🎨" : "¡Hola! ¿En qué te ayudo?");

  } catch (error) {
    console.error("Error in mascot chat:", error);
    return "Dame un segundo, estoy acomodando unos cuadernos...";
  }
};