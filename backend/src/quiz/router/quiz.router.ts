import { Router } from 'express';
import { QuizController } from '../controller/quiz.controller';
import { QuizService } from '../service/quiz.service';

const router = Router();

const quizSerivce = new QuizService()
const quizController = new QuizController(quizSerivce)

router.get('/me', quizController.getMyCollections)
router.post("/", quizController.createCollection)
router.put('/:id',  quizController.updateCollection)
router.get('/shared', quizController.getSharedCollections)
// 컬렉션 삭제
router.delete('/:id', quizController.deleteCollection)

// 특정 문장 삭제
router.delete('/:collectionId/sentences/:sentenceId', quizController.deleteSentence)

// 공유 상태 토글
router.patch('/:id/share', quizController.toggleShare)


router.post('/:id/import', quizController.importSharedCollection)



export default router;