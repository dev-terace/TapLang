import { defineStore } from "pinia";
import { ref } from "vue";
import { TranslatorApi } from "../api/ai.trans.api";

export const useTranslatorStore = defineStore("translator", () => {

  // =====================================================
  // 입력창 AI 번역
  // =====================================================

  const isInputTranslating = ref(false);


  // =====================================================
  // 메시지 번역
  // =====================================================

  const isMessageTranslating = ref(false);

  const translatingMessageId = ref<string | number | null>(null);


  // =====================================================
  // 입력창 번역
  // =====================================================

  const translateInput = async (
    targetLang: string,
    text: string
  ) => {

    if (
      !text.trim() ||
      isInputTranslating.value
    ) {
      return null;
    }

    try {

      isInputTranslating.value = true;

      const result =
        await TranslatorApi.translate(
          targetLang,
          text,
          "input"
        );

      return result;

    } catch (error) {

      console.error(
        "AI 입력창 번역 실패:",
        error
      );

      throw error;

    } finally {

      isInputTranslating.value = false;

    }
  };


  // =====================================================
  // 메시지 번역
  // =====================================================

  const translateMessage = async (
    messageId: string | number,
    targetLang: string,
    text: string
  ) => {

    // 이미 다른 메시지를 번역 중이면 실행하지 않음
    if (isMessageTranslating.value) {
      return null;
    }

    if (!text.trim()) {
      return null;
    }

    try {

      isMessageTranslating.value = true;

      // 현재 번역 중인 메시지 ID
      translatingMessageId.value = messageId;

      const result =
        await TranslatorApi.translate(
          targetLang,
          text,
          "message"
        );

      return result;

    } catch (error) {

      console.error(
        "AI 메시지 번역 실패:",
        error
      );

      throw error;

    } finally {

      isMessageTranslating.value = false;

      translatingMessageId.value = null;

    }
  };


  return {
    isInputTranslating,

    isMessageTranslating,
    translatingMessageId,

    translateInput,
    translateMessage,
  };
});