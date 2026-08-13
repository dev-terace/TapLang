import api from "@/shared/auth/api.config";

export interface TranslateRequest {
  targetLang: string;
  text: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  originalPattern: string;
  translatedPattern: string;
}

export namespace TranslatorApi {
  export async function translate(
    targetLang: string,
    text: string,
    mode: string
  ): Promise<TranslationResult | false> {
    const response = await api.post<TranslationResult | false>(
      "/api/translate",
      {
        targetLang,
        text,
        mode
      }
    );

    console.log("translate response:", response.data);

    return response.data;
  }
}