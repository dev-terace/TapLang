## [taplang.net](https://taplang.net)



평소 영어 공부에 관심이 많아 시작한 프로젝트입니다.

한국어로 채팅하더라도 **몇 번의 클릭만으로 원하는 언어로 번역**할 수 있도록 하였으며, 채팅 중 번역 기능을 통해 서로 다른 언어를 사용하는 사용자도 편리하게 대화할 수 있도록 구현했습니다.

또한 **퀴즈 기능**을 통해 사용자가 직접 문제를 만들고 다른 사용자와 공유할 수 있습니다.

단순히 번역 기능만 제공하는 것이 아니라, **채팅을 통한 커뮤니케이션과 퀴즈를 통한 학습을 하나의 서비스에서 경험할 수 있도록** 구성했습니다.



## 주요 기능

* 실시간 채팅
* 채팅 메시지 번역
* 다국어 지원
* 퀴즈 생성 및 공유
* 채팅방 생성 및 관리
* 친구 초대 및 관리
* 이미지 전송

## 기술 스택

### Backend

* TypeScript
* Node.js
* Prisma
* PostgreSQL
* MongoDB
* Redis

### Frontend

* TypeScript
* Vue.js
* Tailwind CSS
* Vue I18n

### Infrastructure & Deployment

* Docker
* Docker Compose
* Nginx
* Cloudflare Tunnel

## Architecture

```text
                         Internet
                            │
                            ▼
                   ┌─────────────────┐
                   │    Cloudflare   │
                   │      Tunnel     │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │      Nginx      │
                   │  Reverse Proxy  │
                   └────────┬────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
       ┌───────────────┐        ┌────────────────┐
       │    Vue.js     │        │    Node.js     │
       │   Frontend    │◄──────►│     Backend    │
       └───────────────┘        └───────┬────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                         ▼              ▼              ▼
                  ┌───────────┐  ┌───────────┐  ┌───────────┐
                  │PostgreSQL │  │  MongoDB  │  │   Redis   │
                  └───────────┘  └───────────┘  └───────────┘
```

## Deployment

Docker를 사용하여 Frontend, Backend 및 필요한 인프라 환경을 컨테이너화하여 구성했습니다.

외부 요청은 **Cloudflare Tunnel**을 통해 서버로 전달되며, **Nginx**를 Reverse Proxy로 사용하여 Frontend와 Backend로 요청을 전달합니다.

```text
Client
  │
  ▼
Cloudflare Tunnel
  │
  ▼
Nginx
  ├── Frontend
  └── Backend
        ├── PostgreSQL
        ├── MongoDB
        └── Redis
```

## ERD

<img width="1254" height="1084" alt="TapLangERD" src="https://github.com/user-attachments/assets/15de5f5c-8d01-4e46-86d6-544da20a8ff3" />



