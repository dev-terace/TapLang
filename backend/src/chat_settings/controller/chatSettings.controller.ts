import { Request, Response } from "express";
import { userService } from "../../users/services/user.service";
import {
  chatSettingsService,
  type ChatSettingsInput,
} from "../service/chatSettings.service";


// =====================================================
// 채팅 설정 조회
// =====================================================

export async function getChatSettings(
  req: Request,
  res: Response,
) {
  try {
    const profileId = await userService.findUserIdByAuthToken(req);

    if (!profileId || Number.isNaN(profileId)) {
      return res.status(400).json({
        error: "Invalid profileId",
      });
    }

    const settings = await chatSettingsService.getChatSettings(profileId);

    return res.json(settings);

  } catch (error) {
    console.error("getChatSettings error:", error);

    return res.status(500).json({
      error: "Failed to get chat settings",
    });
  }
}


// =====================================================
// 채팅 설정 저장 / 수정
// =====================================================

export async function updateChatSettings(
  req: Request,
  res: Response,
) {
  try {
    const profileId = await userService.findUserIdByAuthToken(req);

    if (!profileId || Number.isNaN(profileId)) {
      return res.status(400).json({
        error: "Invalid profileId",
      });
    }

    const {
      chatSourceLanguage,
      chatTargetLanguage,
      messageTranslateLanguage,
      originalVoiceLanguage,
      translatedVoiceLanguage,
      notificationEnabled,
    } = req.body;


    const data: ChatSettingsInput = {
      chatSourceLanguage,
      chatTargetLanguage,
      messageTranslateLanguage,
      originalVoiceLanguage,
      translatedVoiceLanguage,
      notificationEnabled,
    };


    const settings = await chatSettingsService.updateChatSettings(
      profileId,
      data,
    );


    return res.json(settings);

  } catch (error) {
    console.error("updateChatSettings error:", error);

    return res.status(500).json({
      error: "Failed to update chat settings",
    });
  }
}