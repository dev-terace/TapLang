import api from "@/shared/auth/api.config"

export interface Sentence {
    id: number
    translatedText: string
    voiceText: string
}

export interface Collection {
    id: number
    title: string
    description: string
    author: string
    isShared: boolean
    isMine: boolean
    learnerCount?: number
    sentences: Sentence[]
}

export interface CreateCollectionDto {
    title: string
    description: string
    isShared: boolean
    sentences: Array<{ translatedText: string; voiceText: string }>
}

// 💡 내 학습 컬렉션 요청/응답 타입 추가
export interface MyCollectionQueryParams {
    cursor?: string | number | null;
    limit?: number;
}

export interface MyCollectionResponse {
    items: Collection[];
    nextCursor: string | number | null;
}

// 공유 게시판 요청/응답 타입
export interface SharedCollectionQueryParams {
    cursor?: string | number | null;
    sort?: 'recent' | 'popular';
    limit?: number;
}

export interface SharedCollectionResponse {
    items: Collection[];
    nextCursor: string | number | null;
}

// REST API 통신 모듈
export const quizApi = {
    // 💡 내 학습 컬렉션 목록 조회 (페이지네이션 파라미터 지원 및 매핑)
    async getMyCollections(
        params?: MyCollectionQueryParams
    ): Promise<MyCollectionResponse> {
        const response = await api.get('/api/quiz/me', {
            params: {
                cursor: params?.cursor,
                limit: params?.limit || 10,
            },
        })

        const data = response.data
        const rawItems = Array.isArray(data) ? data : data.items || []
        const nextCursor = Array.isArray(data) ? null : data.nextCursor ?? null

        const mappedItems: Collection[] = rawItems.map((col: any) => ({
            id: col.id,
            title: col.title,
            description: col.description || '',
            author: typeof col.author === 'object' ? col.author?.name || '나' : col.author || '나',
            isShared: col.isShared,
            isMine: true,
            sentences: (col.sentences || []).map((s: any) => ({
                id: s.id,
                voiceText: s.voiceText,
                translatedText: s.translatedText,
            })),
        }))

        return {
            items: mappedItems,
            nextCursor,
        }
    },

    // 공유 게시판 컬렉션 목록 조회
    getSharedCollections: async (
        params: SharedCollectionQueryParams
    ): Promise<SharedCollectionResponse> => {
        const response = await api.get<SharedCollectionResponse>('/api/quiz/shared', {
            params: {
                cursor: params.cursor,
                sort: params.sort || 'recent',
                limit: params.limit || 10,
            },
        })

        return {
            nextCursor: response.data.nextCursor,
            items: (response.data.items || []).map((col: any) => ({
                id: col.id,
                title: col.title,
                description: col.description || '',
                author: typeof col.author === 'object' ? col.author?.name || '익명' : col.author || '익명',
                isShared: col.isShared,
                isMine: false,
                learnerCount: col.learnerCount || 0,
                sentences: (col.sentences || []).map((s: any) => ({
                    id: s.id,
                    translatedText: s.translatedText,
                    voiceText: s.voiceText,
                })),
            })),
        }
    },

    // 새 컬렉션 생성
    async createCollection(dto: CreateCollectionDto): Promise<Collection> {
        console.log("createCollection ", dto)
        const response = await api.post("/api/quiz", dto);
        const data = response.data

        return {
            id: data.id,
            title: data.title,
            description: data.description || '',
            author: data.author?.name || '나',
            isShared: data.isShared,
            isMine: true,
            sentences: (data.sentences || []).map((s: any) => ({
                id: s.id,
                voiceText: s.voiceText,
                translatedText: s.translatedText,
            })),
        }
    },

    // 컬렉션 수정
    async updateCollection(id: number, dto: CreateCollectionDto, existingAuthor?: string): Promise<Collection> {
        const response = await api.put(`/api/quiz/${id}`, dto)
        const data = response.data

        return {
            id: data.id,
            title: data.title,
            description: data.description || '',
            author: existingAuthor || data.author?.name || '나',
            isShared: data.isShared,
            isMine: true,
            sentences: (data.sentences || []).map((s: any) => ({
                id: s.id,
                translatedText: s.translatedText,
                voiceText: s.voiceText,
            })),
        }
    },

    // 컬렉션 삭제
    async deleteCollection(id: number): Promise<boolean> {
        await api.delete(`/api/quiz/${id}`)
        return true
    },

    // 특정 문장 삭제
    async deleteSentence(collectionId: number, sentenceId: number): Promise<boolean> {
        await api.delete(`/api/quiz/${collectionId}/sentences/${sentenceId}`)
        return true
    },

    // 공유 상태 토글
    async toggleShare(id: number, isShared: boolean): Promise<boolean> {
        await api.patch(`/api/quiz/${id}/share`, { isShared })
        return true
    },

    // 공유 컬렉션 가져오기
    async importCollection(id: number): Promise<Collection> {
        const response = await api.post(`/api/quiz/${id}/import`)
        const data = response.data

        return {
            id: data.id,
            title: data.title,
            description: data.description || '',
            author: data.author?.name || '공유 작성자',
            isShared: data.isShared,
            isMine: true,
            sentences: (data.sentences || []).map((s: any) => ({
                id: s.id,
                translatedText: s.translatedText,
                voiceText: s.voiceText,
            })),
        }
    }
}