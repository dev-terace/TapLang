import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '@/types'


export const useTransTagStore = defineStore('transTag', () => {

  // 입력 중인 태그
  const newTag = ref<Tag>({
    eng: '',
    kor: ''
  })


  // 등록된 태그 목록
  const engTags = ref<Tag[]>([
    {
      eng: 'Based',
      kor: '주관이 뚜렷하고 당당한 훌륭한 태도'
    },
    {
      eng: 'Slay',
      kor: '압도적으로 멋지게 해내다'
    }
  ])


  // 태그 등록
  const registerEngTag = () => {

    if (!newTag.value.eng || !newTag.value.kor) {
      return {
        success: false,
        message: '영어 원문과 한국어 순화 내용을 모두 입력해주세요.'
      }
    }


    engTags.value.unshift({
      eng: newTag.value.eng,
      kor: newTag.value.kor
    })


    newTag.value = {
      eng: '',
      kor: ''
    }


    return {
      success: true,
      message: '태그가 성공적으로 등록되었습니다.'
    }
  }


  return {
    newTag,
    engTags,
    registerEngTag
  }

})