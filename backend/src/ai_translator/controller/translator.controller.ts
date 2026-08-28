import { Request, Response } from "express";
import { translateService } from "../service/translator.service";
import { translatorRedisService } from "../service/translator.redis.service";
import { userService } from "../../users/services/user.service";
import { profileDetailService } from "../../profile/service/profile.details.service";

export async function translate(
  req: Request,
  res: Response,
) {
  try {

    const { targetLang, text, mode } = req.body;

    if (!targetLang || !text) {
      return res.status(400).json({
        error: "targetLang and text are required",
      });
    }

    // 인증된 사용자라고 가정
    const userId = await userService.findUserIdByAuthToken(req);



    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // IP
    const ip = req.ip ?? 'unknown';

    const rateLimit =
      await translatorRedisService.checkRateLimit(
        userId,
        ip,
      );

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: "Too many translation requests",
        userRemaining: rateLimit.userRemaining,
        ipRemaining: rateLimit.ipRemaining,
      });
    }

    const result =
      await translateService.translate(
        targetLang,
        text,
        mode,
      );

    console.log("result : ", result);


    if (mode === "input") {
      await profileDetailService.incrementAiTranslationCount(userId);
    }

    return res.json(result);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Translation failed",
    });
  }
}