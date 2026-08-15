import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export class ImageService {
  private uploadDir: string;

  constructor() {
    // 1. .env에서 UPLOAD_DIR 읽기 (없으면 기본값 'uploads')
    const envDir = process.env.UPLOAD_DIR || 'uploads';

    // 2. 절대 경로면 그대로 쓰고, 상대 경로면 process.cwd()와 결합
    this.uploadDir = path.isAbsolute(envDir)
      ? envDir
      : path.join(process.cwd(), envDir);
  }

  // 이미지 압축 및 디스크 저장
  async processAndSaveImage(fileBuffer: Buffer) {
    const imageGuid = uuidv4();
    const filename = `${imageGuid}.webp`;
    const filePath = path.join(this.uploadDir, filename);

    // uploads 디렉토리가 없으면 생성
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Sharp 이미지 리사이징 & WebP 변환
    await sharp(fileBuffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);

    return {
      url: `/api/image/${imageGuid}`,
      guid: imageGuid,
    };
  }

  // GUID로 실제 파일 경로 조회 및 검증
  async getImagePathByGuid(guid: string): Promise<string> {
    // GUID 포맷 검증 (Directory Traversal 공격 방지)
    if (!/^[a-zA-Z0-9-]+$/.test(guid)) {
      throw new Error('INVALID_GUID');
    }

    const filePath = path.join(this.uploadDir, `${guid}.webp`);

    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      throw new Error('FILE_NOT_FOUND');
    }
  }
}

export const imageService = new ImageService();