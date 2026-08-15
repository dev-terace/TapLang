import { Router } from 'express';
import multer from 'multer';
import { imageController } from '../controller/image.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB 제한
});

const router = Router();



// 이미지 업로드 라우트
router.post('/upload', upload.single('image'), (req, res) =>
  imageController.uploadImage(req, res)
);

// 이미지 조회 라우트
router.get('/:guid', (req, res) =>
  imageController.getImage(req, res)
);

export default router;