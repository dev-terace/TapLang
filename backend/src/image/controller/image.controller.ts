import { Request, Response } from 'express';
import { imageService } from '../service/image.service';

export class ImageController {
  // POST /api/image/upload
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '파일이 업로드되지 않았증니다.' });
      }

      const result = await imageService.processAndSaveImage(req.file.buffer);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Image Upload Error:', error);
      return res.status(500).json({ error: '이미지 처리 중 오류가 발생했습니다.' });
    }
  }

  // GET /api/image/:guid
  async getImage(req: Request, res: Response) {
    try {
      const { guid } = req.params;
      const filePath = await imageService.getImagePathByGuid(guid);

      return res.sendFile(filePath);
    } catch (error: any) {
      if (error.message === 'INVALID_GUID') {
        return res.status(400).json({ error: '유효하지 않은 이미지 ID입니다.' });
      }
      if (error.message === 'FILE_NOT_FOUND') {
        return res.status(404).json({ error: '만료되었거나 존재하지 않는 이미지입니다.' });
      }
      return res.status(500).json({ error: '이미지 조회 중 오류가 발생했습니다.' });
    }
  }
}

export const imageController = new ImageController();