import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { mongoPrisma } from '../../lib/prisma'

const MAX_AGE = 1000 * 60 * 60 * 24 * 30 // 30일

async function cleanupUploads() {
  try {
    const UPLOAD_DIR = process.env.UPLOAD_DIR

    if (!UPLOAD_DIR) {
      throw new Error('UPLOAD_DIR 환경변수가 설정되지 않았습니다.')
    }

    // 없으면 생성
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const files = await fs.readdir(UPLOAD_DIR, {
      withFileTypes: true,
    })

    const now = Date.now()

    for (const file of files) {
      if (!file.isFile()) {
        continue
      }

      const filePath = path.join(UPLOAD_DIR, file.name)

      try {
        const stats = await fs.stat(filePath)
        const age = now - stats.mtimeMs

        if (age < MAX_AGE) {
          continue
        }

        const guid = path.parse(file.name).name

        console.log(
          `[Upload Cleanup] 만료 파일 발견: ${file.name}, guid=${guid}`
        )

        // TODO: DB attachment 처리

        await fs.unlink(filePath)

        console.log(
          `[Upload Cleanup] 삭제됨: ${file.name}`
        )
      } catch (error) {
        console.error(
          `[Upload Cleanup] 파일 처리 실패: ${filePath}`,
          error
        )
      }
    }
  } catch (error) {
    console.error(
      '[Upload Cleanup] 디렉토리 읽기 실패:',
      error
    )
  }
}

cron.schedule('* * * * *', () => {
  console.log('[Upload Cleanup] 파일 검사 시작')
  cleanupUploads()
})