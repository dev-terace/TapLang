import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


export interface PrivateRoom {
  id: number;
  title: string;
  desc: string;
  owner: string;
  members: number;
  isSecret: boolean;
}

export const useGroupChatStore = defineStore('groupChat', () => {
  const privateFilter = ref<'all' | 'secret'>('all')

  const privateRooms = ref<PrivateRoom[]>([
    {
      id: 1,
      title: '영어 슬랭 완전 정복',
      desc: '새로 등록된 태그 공유합니다.',
      owner: '영문학도',
      members: 12,
      isSecret: false
    },
    {
      id: 2,
      title: '시크릿 프로젝트 V',
      desc: '비인가자 접근 금지 구역',
      owner: 'admin_00',
      members: 4,
      isSecret: true
    },
    {
      id: 3,
      title: '레트로 코딩 스터디',
      desc: 'C언어와 어셈블리 토론방',
      owner: '해커박',
      members: 8,
      isSecret: false
    },
    {
      id: 4,
      title: '사내 임원진 회의실',
      desc: '관계자 외 출입 금지',
      owner: 'CEO',
      members: 6,
      isSecret: true
    }
  ])


  // 필터 변경
  const changePrivateFilter = (
    filter: 'all' | 'secret'
  ) => {
    privateFilter.value = filter
  }


  // 현재 필터에 맞는 방 목록
  const filteredPrivateRooms = computed(() => {
    if (privateFilter.value === 'all') {
      return privateRooms.value
    }

    return privateRooms.value.filter(
      room => room.isSecret
    )
  })


  // 방 클릭 처리
  const handlePrivateRoomClick = (
    room: PrivateRoom
  ) => {

    if (room.isSecret) {

      const pwd = prompt(
        `[${room.title}] 은(는) 비밀 대화방입니다.\n입장 패스워드를 입력하세요:`
      )

      if (pwd) {
        alert('패스워드 검증 로직 연결이 필요합니다.')
      }

      return
    }


    alert(
      `[${room.title}] 사설 대화방 입장을 시도합니다.`
    )
  }


  return {
    privateFilter,
    privateRooms,
    filteredPrivateRooms,
    changePrivateFilter,
    handlePrivateRoomClick
  }
})