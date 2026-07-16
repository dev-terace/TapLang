export interface Friend {
  id: number
  name: string
  avatar: string
  statusMsg: string
  online: boolean
}

export interface User {
  name: string
  avatar: string
  role: string
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