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



// 요청 파라미터 타입
export interface SharedCollectionQueryParams {
    cursor?: string | number | null;
    sort?: 'recent' | 'popular';
    limit?: number;
}

// 백엔드 응답 타입
export interface SharedCollectionResponse {
    items: Collection[];
    nextCursor: string | number | null;
}


// REST API 통신 모듈 (Axios 또는 fetch 기반 백엔드 연동)
export const quizApi = {
    // 내 학습 컬렉션 목록 조회
    async getMyCollections(): Promise<Collection[]> {
        const response = await api.get('/api/quiz/me')
        const list = response.data

        return list.map((col: any) => ({
            id: col.id,
            title: col.title,
            description: col.description || '',
            author: col.author?.name || '나',
            isShared: col.isShared,
            isMine: true,
            sentences: (col.sentences || []).map((s: any) => ({
                id: s.id,
                voiceText: s.voiceText,
                translatedText: s.translatedText,
            })),
        }))
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

        // 💡 백엔드 응답 데이터를 프론트엔드 Collection 구조에 맞게 매핑
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
            // 기존 작성자명에 '(가져옴)'이 포함되어 있으면 그대로 유지, 없으면 DB 반환값 사용
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

    // 2. 특정 문장 삭제
    async deleteSentence(collectionId: number, sentenceId: number): Promise<boolean> {
        await api.delete(`/api/quiz/${collectionId}/sentences/${sentenceId}`)
        return true
    },

    // 3. 공유 상태 토글
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
            author: data.author?.name || '공유 작성자', // 백엔드에서 전달된 원작자 이름 적용
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