import { Request, Response } from "express";
import { translateService } from "../service/translator.service";

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

    const result = await translateService.translate(targetLang, text, mode);

    console.log("result : ", result);
    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Translation failed",
    });
  }
}