export interface Friend {
  id: number
  name: string
  avatar: string
  statusMsg: string
  online: boolean
}

export interface Country {
  code: string
  name: string
  flag: string
}

export interface MyProfile {
  id: number
  name: string
  avatar: string
  statusMsg: string
}


export interface ChatMember {
  id: number
  name: string
  avatar: string
  online: boolean
}

export interface ChatRoom {
  id: number
  name: string
  type: 'dm' | 'group'
  members: ChatMember[]
  lastMessage: string
  lastTime: string
  unread: number
  pinned: boolean
  muted: boolean
}


export interface PrivateRoom {
  id: number
  title: string
  desc: string
  owner: string
  members: number
  isSecret: boolean
}

export interface Tag {
  eng: string
  kor: string
}