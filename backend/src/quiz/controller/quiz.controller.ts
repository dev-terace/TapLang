import { Request, Response } from 'express'
import { QuizService } from '../service/quiz.service'
import { CreateCollectionDto } from '../service/quiz.service'
import { userService } from '../../users/services/user.service'
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  createCollection = async (req: Request, res: Response) => {
    try {
      const userId = await userService.findUserIdByAuthToken(req)
      const dto: CreateCollectionDto = req.body

      if (!dto.title || !dto.sentences || !Array.isArray(dto.sentences)) {
        return res.status(400).json({ message: '필수 값이 누락되었습니다.' })
      }

      console.log("create Collection dto", dto)

      const newCollection = await this.quizService.createCollection(userId, dto)
      return res.status(201).json(newCollection)
    } catch (error) {
      console.error('컬렉션 생성 실패:', error)
      return res.status(500).json({ message: '서버 에러가 발생했습니다.' })
    }
  }


  getMyCollections = async (req: Request, res: Response) => {
    try {
      const userId = await userService.findUserIdByAuthToken(req)
      const collections = await this.quizService.getMyCollections(userId)


      console.log("getMyCollections", collections)
      return res.status(200).json(collections)
    } catch (error) {
      console.error('내 컬렉션 조회 실패:', error)
      return res.status(500).json({ message: '서버 에러가 발생했습니다.' })
    }
  }


  updateCollection = async (req: Request, res: Response) => {
    try {
      const collectionId = Number(req.params.id)
      const userId = await userService.findUserIdByAuthToken(req) // 인증된 사용자 ID
      const dto = req.body

      if (isNaN(collectionId)) {
        return res.status(400).json({ message: '올바르지 않은 컬렉션 ID입니다.' })
      }

      const updatedCollection = await this.quizService.updateCollection(collectionId, userId, dto)
      return res.status(200).json(updatedCollection)
    } catch (error: any) {
      console.error('컬렉션 수정 실패:', error)
      return res.status(error.status || 500).json({ message: error.message || '서버 오류가 발생했습니다.' })
    }
  }


  getSharedCollections = async (req: Request, res: Response) => {
    try {
      const { cursor, sort, limit } = req.query;

      // Query 파라미터 추출 및 타입 파싱
      const parsedLimit = limit ? parseInt(limit as string, 10) : 10;
      const parsedSort = sort === 'popular' ? 'popular' : 'recent';
      const parsedCursor = cursor ? String(cursor) : null;

      // Service 호출 시 파라미터 객체 전달
      const result = await this.quizService.getSharedCollections({
        cursor: parsedCursor,
        sort: parsedSort,
        limit: parsedLimit,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('공유 컬렉션 조회 실패:', error);
      return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  }


  deleteCollection = async (req: Request, res: Response) => {
    try {
      const collectionId = Number(req.params.id)
      const userId = await userService.findUserIdByAuthToken(req)

      if (isNaN(collectionId)) {
        return res.status(400).json({ message: '올바르지 않은 컬렉션 ID입니다.' })
      }

      await this.quizService.deleteCollection(collectionId, userId)
      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('컬렉션 삭제 실패:', error)
      return res.status(error.status || 500).json({ message: error.message || '서버 에러가 발생했습니다.' })
    }
  }

  // 2. 특정 문장 삭제
  deleteSentence = async (req: Request, res: Response) => {
    try {
      const collectionId = Number(req.params.collectionId)
      const sentenceId = Number(req.params.sentenceId)
      const userId = await userService.findUserIdByAuthToken(req)

      if (isNaN(collectionId) || isNaN(sentenceId)) {
        return res.status(400).json({ message: '올바르지 않은 ID 값입니다.' })
      }

      await this.quizService.deleteSentence(collectionId, sentenceId)
      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('문장 삭제 실패:', error)
      return res.status(error.status || 500).json({ message: error.message || '서버 에러가 발생했습니다.' })
    }
  }

  // 3. 공유 상태 토글
  toggleShare = async (req: Request, res: Response) => {
    try {
      const collectionId = Number(req.params.id)
      const userId = await userService.findUserIdByAuthToken(req)
      const { isShared } = req.body

      if (isNaN(collectionId) || typeof isShared !== 'boolean') {
        return res.status(400).json({ message: '올바르지 않은 요청 데이터입니다.' })
      }

      await this.quizService.toggleShare(collectionId, userId, isShared)
      return res.status(200).json({ success: true })
    } catch (error: any) {
      console.error('공유 상태 변경 실패:', error)
      return res.status(error.status || 500).json({ message: error.message || '서버 에러가 발생했습니다.' })
    }
  }

  importSharedCollection = async (req: Request, res: Response) => {
    try {
      const collectionId = Number(req.params.id)
      const userId = await userService.findUserIdByAuthToken(req)

      if (isNaN(collectionId)) {
        return res.status(400).json({ message: '올바르지 않은 컬렉션 ID입니다.' })
      }

      const result = await this.quizService.importSharedCollection(collectionId, userId)
      return res.status(201).json(result)
    } catch (error: any) {
      console.error('공유 컬렉션 가져오기 실패:', error)
      return res.status(500).json({ message: error.message || '서버 에러가 발생했습니다.' })
    }
  }

}