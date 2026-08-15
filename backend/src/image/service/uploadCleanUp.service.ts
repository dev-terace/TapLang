import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { mongoPrisma } from "../../lib/prisma";

const prisma = mongoPrisma

const UPLOAD_DIR = process.env.UPLOAD_DIR

if (!UPLOAD_DIR) {
  throw new Error('UPLOAD_DIR 환경변수가 설정되지 않았습니다.')
}

const MAX_AGE = 60 * 1000 * 60 * 24 * 30// 30일

async function cleanupUploads() {
  try {
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

        // 확장자를 제외한 파일명 = guid
        const guid = path.parse(file.name).name

        console.log(
          `[Upload Cleanup] 만료 파일 발견: ${file.name}, guid=${guid}`
        )

        // DB attachment 처리

        // 실제 파일 삭제
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




// 매 1분마다 실행
cron.schedule('* * * * *', () => {
  console.log('[Upload Cleanup] 파일 검사 시작')
  cleanupUploads()
})

console.log(
  `[Upload Cleanup] 스케줄러 시작 - ${UPLOAD_DIR}`
)