import { postgresPrisma } from "../../lib/prisma"

export interface CreateCollectionDto {
  title: string
  description?: string
  isShared?: boolean
  sentences: Array<{ translatedText: string; voiceText: string }>
}

interface GetSharedParams {
  cursor: string | null;
  sort: 'recent' | 'popular';
  limit: number;
}


interface GetMyCollectionsParams {
  userId: number
  cursor?: string | null
  limit?: number
}


export class QuizService {
  // 1. 내 학습 컬렉션 목록 조회
async getMyCollections(params: GetMyCollectionsParams) {
    const { userId, cursor, limit = 10 } = params

    let prismaQuery: any = {
      where: {
        authorId: userId,
      },
      take: limit + 1,
      orderBy: {
        id: 'desc',
      },
      include: {
        sentences: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }

    if (cursor) {
      prismaQuery.cursor = { id: parseInt(cursor, 10) }
      prismaQuery.skip = 1
    }

    const collections = await postgresPrisma.quizCollection.findMany(prismaQuery)

    let nextCursor: string | null = null

    if (collections.length > limit) {
      collections.pop() // 초과 조회된 데이터 제거
      const lastItem = collections[collections.length - 1]
      if (lastItem) {
        nextCursor = String(lastItem.id)
      }
    }

    return {
      items: collections,
      nextCursor,
    }
  }

  // 2. 공유 게시판 컬렉션 목록 조회
async getSharedCollections(params: GetSharedParams) {
  const { cursor, sort, limit } = params;

  let prismaQuery: any = {
    where: { isShared: true },
    take: limit + 1,
    include: {
      sentences: true,
    },
  };

  if (sort === 'recent') {
    prismaQuery.orderBy = { id: 'desc' };
    if (cursor) {
      prismaQuery.cursor = { id: parseInt(cursor, 10) };
      prismaQuery.skip = 1;
    }
  } else if (sort === 'popular') {
    prismaQuery.orderBy = [
      { learnerCount: 'desc' },
      { id: 'desc' }
    ];
    if (cursor) {
      const [_, idStr] = cursor.split('_');
      prismaQuery.cursor = { id: parseInt(idStr, 10) };
      prismaQuery.skip = 1;
    }
  }

  const collections = await postgresPrisma.quizCollection.findMany(prismaQuery);

  let nextCursor: string | null = null;
  
  if (collections.length > limit) {
    collections.pop(); // 초과 조회된 11번째 데이터는 응답 배열에서 제외
    
    // 💡 핵심: 응답으로 들어가는 배열의 '마지막 항목(10번째)'을 다음 커서로 지정
    const lastItem = collections[collections.length - 1];

    if (lastItem) {
      if (sort === 'recent') {
        nextCursor = String(lastItem.id);
      } else if (sort === 'popular') {
        nextCursor = `${lastItem.learnerCount}_${lastItem.id}`;
      }
    }
  }

  const items = collections.map((col: any) => ({
    id: col.id,
    title: col.title,
    description: col.description,
    author: col.author || col.user?.name || '익명',
    isShared: col.isShared,
    learnerCount: col.learnerCount,
    sentences: col.sentences,
    createdAt: col.createdAt,
  }));

  return {
    items,
    nextCursor
  };
}

  // 3. 새 컬렉션 생성
  async createCollection(ownId: number, dto: CreateCollectionDto) {
    return await postgresPrisma.quizCollection.create({
      data: {
        title: dto.title,
        description: dto.description,
        isShared: dto.isShared ?? false,
        authorId: ownId,
        sentences: {
          create: dto.sentences.map((s) => ({
            translatedText: s.translatedText,
            voiceText: s.voiceText,
          })),
        },
      },
      include: {
        sentences: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  // 4. 컬렉션 수정 (기존 문장 삭제 후 재생성)
  async updateCollection(collectionId: number, userId: number, dto: CreateCollectionDto) {
    const existingCol = await postgresPrisma.quizCollection.findUnique({
      where: { id: collectionId },
    })

    if (!existingCol) {
      throw { status: 404, message: '컬렉션을 찾을 수 없습니다.' }
    }
    if (existingCol.authorId !== userId) {
      throw { status: 403, message: '수정 권한이 없습니다.' }
    }

    return await postgresPrisma.$transaction(async (tx) => {
      // Prisma 스키마 외래키 이름(quizCollectionId) 적용
      await tx.quizSentence.deleteMany({
        where: { quizCollectionId: collectionId },
      })

      return await tx.quizCollection.update({
        where: { id: collectionId },
        data: {
          title: dto.title,
          description: dto.description,
          isShared: dto.isShared ?? false,
          sentences: {
            create: dto.sentences.map((s) => ({
              translatedText: s.translatedText,
              voiceText: s.voiceText,
            })),
          },
        },
        include: {
          sentences: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    })
  }

  // 5. 컬렉션 삭제 (Cascade 설정에 의해 하위 quizSentence도 자동 삭제됨)
  async deleteCollection(collectionId: number, userId: number) {
    const existingCol = await postgresPrisma.quizCollection.findUnique({
      where: { id: collectionId },
    })

    if (!existingCol) {
      throw { status: 404, message: '컬렉션을 찾을 수 없습니다.' }
    }
    if (existingCol.authorId !== userId) {
      throw { status: 403, message: '삭제 권한이 없습니다.' }
    }

    await postgresPrisma.quizCollection.delete({
      where: { id: collectionId },
    })

    return { success: true }
  }

  // 6. 단일 문장 삭제
  async deleteSentence(sentenceId: number, userId: number) {
    const sentence = await postgresPrisma.quizSentence.findUnique({
      where: { id: sentenceId },
      include: { quizCollection: true },
    })

    if (!sentence) {
      throw { status: 404, message: '문장을 찾을 수 없습니다.' }
    }
    if (sentence.quizCollection.authorId !== userId) {
      throw { status: 403, message: '삭제 권한이 없습니다.' }
    }

    await postgresPrisma.quizSentence.delete({
      where: { id: sentenceId },
    })

    return { success: true }
  }

  // 7. 공유 상태 토글 (Public <-> Private)
  async toggleShare(collectionId: number, userId: number, isShared: boolean) {
    const existingCol = await postgresPrisma.quizCollection.findUnique({
      where: { id: collectionId },
    })

    if (!existingCol) {
      throw { status: 404, message: '컬렉션을 찾을 수 없습니다.' }
    }
    if (existingCol.authorId !== userId) {
      throw { status: 403, message: '수정 권한이 없습니다.' }
    }

    return await postgresPrisma.quizCollection.update({
      where: { id: collectionId },
      data: { isShared },
    })
  }



// 공유 컬렉션을 내 학습장으로 복사 생성
async importSharedCollection(originalCollectionId: number, myProfileId: number) {
  // 1. 원본 컬렉션 및 문장들 조회
  const original = await postgresPrisma.quizCollection.findUnique({
    where: { id: originalCollectionId },
    include: { sentences: true }
  });

  if (!original) throw new Error("컬렉션을 찾을 수 없습니다.");

  // 2. 트랜잭션으로 [내 복사본 생성 + 원본 조회수 증가] 동시에 처리
  const result = await postgresPrisma.$transaction(async (tx) => {
    
    // A. 원본 컬렉션의 learnerCount 1 증가
    await tx.quizCollection.update({
      where: { id: originalCollectionId },
      data: { learnerCount: { increment: 1 } }
    });

    // B. 내 학습장에 복사본 생성 (isShared는 false로, originalId 기록)
    const newCollection = await tx.quizCollection.create({
      data: {
        title: original.title,
        description: original.description,
        isShared: false,
        authorId: myProfileId,
        learnerCount: 0,
        sentences: {
          create: original.sentences.map(s => ({
            translatedText: s.translatedText,
            voiceText: s.voiceText
          }))
        }
      }
    });

    return newCollection;
  });

  return result;
}
}