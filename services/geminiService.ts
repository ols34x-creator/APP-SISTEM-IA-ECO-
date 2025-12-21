
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn(
    "API_KEY environment variable not set. AI features will not work."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateEcoLogLogo = async (): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
    }

    const prompt = `
        Create a professional, minimalist, and futuristic corporate logo for a company called 'EcoLog'. 
        The primary visual element is a stylized human brain. 
        Integrating within the brain's structure, include subtle neural networks that look like global logistics shipping routes and electronic circuit board patterns. 
        A clean, vibrant green emerald leaf should be gracefully merged with the brain structure to represent sustainability.
        Style: Modern vector logo, flat design, symmetrical, high contrast. 
        Colors: Emerald Green, Deep Navy Blue, and Teal. 
        Background: Solid white. 
        No text, only the iconic symbol.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ parts: [{ text: prompt }] }],
        });

        if (!response.candidates?.[0]?.content?.parts) {
            throw new Error("No response from model.");
        }

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }

        throw new Error("Logo image not found in response.");
    } catch (error) {
        console.error("Error generating logo:", error);
        throw error;
    }
};

export const editImageWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response content from model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image was generated in the response.");
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw new Error("Failed to edit image. Please check the console for details.");
  }
};

export const analyzeDocument = async (
  base64Data: string,
  mimeType: string
): Promise<{ fullText: string; documentType: string; keyFields: Record<string, string> }> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  try {
    const prompt = `
      Analyze the provided document. It can be an Image, PDF, TXT, XML, or HTML file.
      1. Perform a full text extraction (OCR) or content parsing.
      2. Identify the type of document (e.g., Invoice, Receipt, Contract, ID Card, BOL, XML Data, HTML Page).
      3. Extract key structured information relevant to the document type into a flat key-value pair list.
         - For Invoices/Receipts: Extract Total Amount, Date, Vendor Name, Invoice Number.
         - For IDs: Extract Name, ID Number, Birth Date.
         - For Logistics Documents (CT-e, BOL): Extract Sender, Receiver, Cargo Value, Weight, Origin, Destination.
         - For XML/HTML: Extract main data nodes or relevant content sections.
      
      Return ONLY a valid JSON object with this structure:
      {
        "fullText": "The complete raw text extracted...",
        "documentType": "Type of document",
        "keyFields": {
          "Label": "Value",
          "Date": "YYYY-MM-DD",
          "Total": "0.00"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing document with Gemini:", error);
    throw new Error("Failed to analyze document. Ensure the file is a valid Image, PDF, Text, XML, or HTML file.");
  }
};
