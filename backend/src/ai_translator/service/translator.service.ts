import openai from "../../lib/openai";
import {
  TRANSLATOR_PROMPT,
  TRANSLATOR_MESSAGE_PROMPT
} from "./translator.prompt";
import { z } from "zod";

// ==========================================
// Input 번역 응답
// ==========================================

const TranslationInputResultSchema = z.object({
  originalText: z.string(),
  translatedText: z.string(),
});


// ==========================================
// Message 번역 응답
// ==========================================

const TranslationMessageResultSchema = z.object({
  translatedText: z.string(),
});


// ==========================================
// 타입
// ==========================================

export type TranslationInputResponse =
  | z.infer<typeof TranslationInputResultSchema>
  | false;

export type TranslationMessageResponse =
  | z.infer<typeof TranslationMessageResultSchema>
  | false;

export type TranslatorResponse =
  | TranslationInputResponse
  | TranslationMessageResponse;


// ==========================================
// Translate
// ==========================================

export async function translate(
  targetLang: string,
  userInput: string,
  mode: string
): Promise<TranslatorResponse> {

  const isInput = mode === "input";

  const selectedPrompt = isInput
    ? TRANSLATOR_PROMPT
    : TRANSLATOR_MESSAGE_PROMPT;

  const prompt = selectedPrompt
    .replace("{{TARGET_LANG}}", targetLang)
    .replace("{{USER_INPUT}}", userInput);

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const output = response.output_text.trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  // ==========================================
  // mode에 따른 응답 검증
  // ==========================================

  if (isInput) {
    return TranslationInputResultSchema
      .or(z.literal(false))
      .parse(parsed);
  }

  return TranslationMessageResultSchema
    .or(z.literal(false))
    .parse(parsed);
}


export const translateService = {
  translate
};