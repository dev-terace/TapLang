import {
  mongoPrisma,
  postgresPrisma,
} from "../../lib/prisma";

import { v7 as uuidv7 } from "uuid";

import {
  ConversationMemberRole,
} from "../../../generated/mongo";


export interface CreateChatParams {
  ownId: number;
  name?: string;
  description?: string;
  password?: string;
}


export interface CustomChatCursor {
  lastMessageAt: string | null;
  memberCount: number;
  createdAt: string;
  id: string;
}


// =========================================================
// Date 변환
// =========================================================

const toISOStringSafe = (
  value: unknown
): string | null => {

  if (!value) {
    return null;
  }

  if (value instanceof Date) {

    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toISOString();
  }


  // Mongo Extended JSON
  if (
    typeof value === "object" &&
    value !== null &&
    "$date" in value
  ) {

    const dateValue =
      (value as { $date: unknown }).$date;

    const date =
      new Date(
        dateValue as string | number
      );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }


  const date =
    new Date(
      value as string | number
    );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};


export class CustomChatRoomService {




async joinCustomChat  (
  conversationId: string,
  userId: number
)  {
  const conversation = await mongoPrisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      type: true,
      name: true,
    },
  })

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND")
  }

  // CUSTOM 방도 GROUP 타입을 사용한다면
  if (conversation.type !== "CUSTOM") {
    throw new Error("NOT_A_GROUP_CHAT")
  }

  // 이미 참가 중인지 확인
  const existingMember =
    await mongoPrisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    })

  // 이미 참가 중이면 그냥 성공 처리
  if (existingMember) {
    return {
      conversationId,
      joined: false,
      alreadyMember: true,
    }
  }

  // 멤버 추가
  const member =
    await mongoPrisma.conversationMember.create({
      data: {
        conversationId,
        userId,
        role: ConversationMemberRole.MEMBER,
      },
    })

  return {
    conversationId,
    joined: true,
    alreadyMember: false,
    member: {
      id: member.id,
      userId: member.userId,
      role: member.role,
    },
  }
}
  // =========================================================
  // CUSTOM 채팅방 생성
  // =========================================================

  async createChatInfo({
    ownId,
    name,
    description,
    password,
  }: CreateChatParams) {

    if (!name?.trim()) {
      throw new Error(
        "채팅방 이름을 입력하세요."
      );
    }


    return mongoPrisma.conversation.create({

      data: {

        id: uuidv7(),

        type: "CUSTOM",

        name: name.trim(),

        description:
          description?.trim() || null,

        password:
          password?.trim() || null,

        members: {

          create: {

            userId: ownId,

            role:
              ConversationMemberRole.OWNER,

          },

        },

      },

      include: {
        members: true,
      },

    });
  }


  // =========================================================
  // CUSTOM 채팅방 목록
  // =========================================================

  async getCustomChats(
    cursor?: CustomChatCursor
  ) {

    const pipeline: any[] = [


      // =====================================================
      // 1. CUSTOM만 조회
      // =====================================================

      {
        $match: {
          type: "CUSTOM",
        },
      },


      // =====================================================
      // 2. ConversationMember 조회
      // =====================================================

      {
        $lookup: {

          from: "ConversationMember",

          localField: "_id",

          foreignField: "conversationId",

          as: "members",

        },
      },


      // =====================================================
      // 3. 멤버 수 + 방장 ID
      // =====================================================

      {
        $addFields: {

          memberCount: {
            $size: "$members",
          },


          ownerId: {

            $let: {

              vars: {

                owner: {

                  $arrayElemAt: [

                    {

                      $filter: {

                        input: "$members",

                        as: "member",

                        cond: {

                          $eq: [
                            "$$member.role",
                            "OWNER",
                          ],

                        },

                      },

                    },

                    0,

                  ],

                },

              },

              in: "$$owner.userId",

            },

          },

        },
      },


      // =====================================================
      // 4. 비밀번호 존재 여부
      //
      // password 자체는 반환하지 않고
      // isSecret만 생성
      // =====================================================

      {
        $addFields: {

          isSecret: {

            $and: [

              {
                $ne: [
                  "$password",
                  null,
                ],
              },

              {
                $ne: [
                  "$password",
                  "",
                ],
              },

            ],

          },

        },
      },


      // =====================================================
      // 5. 불필요한 데이터 제거
      // =====================================================

      {
        $project: {

          members: 0,

          password: 0,

        },
      },

    ];


    // =========================================================
    // Cursor
    // =========================================================

    if (cursor) {

      const createdAt =
        new Date(
          cursor.createdAt
        );

      if (
        Number.isNaN(
          createdAt.getTime()
        )
      ) {

        throw new Error(
          "INVALID_CURSOR"
        );

      }


      const lastMessageAt =
        cursor.lastMessageAt
          ? new Date(
              cursor.lastMessageAt
            )
          : null;


      if (
        lastMessageAt &&
        Number.isNaN(
          lastMessageAt.getTime()
        )
      ) {

        throw new Error(
          "INVALID_CURSOR"
        );

      }


      // =====================================================
      // 메시지가 있는 방
      // =====================================================

      if (lastMessageAt) {

        pipeline.push({

          $match: {

            $or: [

              // 최근 메시지가 더 오래됨
              {
                lastMessageAt: {
                  $lt: lastMessageAt,
                },
              },


              // 메시지 시간이 같고
              // 사람이 더 적음
              {
                lastMessageAt,

                memberCount: {
                  $lt: cursor.memberCount,
                },
              },


              // 메시지 시간 + 인원 같음
              // 생성일이 더 오래됨
              {
                lastMessageAt,

                memberCount:
                  cursor.memberCount,

                createdAt: {
                  $lt: createdAt,
                },
              },


              // 모든 값이 같음
              {
                lastMessageAt,

                memberCount:
                  cursor.memberCount,

                createdAt,

                _id: {
                  $lt: cursor.id,
                },
              },

            ],

          },

        });

      }


      // =====================================================
      // 메시지가 없는 방
      // =====================================================

      else {

        pipeline.push({

          $match: {

            $or: [

              {
                lastMessageAt: null,

                memberCount: {
                  $lt: cursor.memberCount,
                },
              },


              {
                lastMessageAt: null,

                memberCount:
                  cursor.memberCount,

                createdAt: {
                  $lt: createdAt,
                },
              },


              {
                lastMessageAt: null,

                memberCount:
                  cursor.memberCount,

                createdAt,

                _id: {
                  $lt: cursor.id,
                },
              },

            ],

          },

        });

      }

    }


    // =========================================================
    // 정렬
    // =========================================================

    pipeline.push({

      $sort: {

        // 최근 메시지 있는 방 우선
        lastMessageAt: -1,

        // 사람이 많은 방 우선
        memberCount: -1,

        // 생성일 최신순
        createdAt: -1,

        // 최종 tie breaker
        _id: -1,

      },

    });


    // =========================================================
    // 최대 30개
    // =========================================================

    pipeline.push({

      $limit: 30,

    });


    // =========================================================
    // Aggregation
    // =========================================================

    const result =
      await mongoPrisma.$runCommandRaw({

        aggregate: "Conversation",

        pipeline,

        cursor: {},

      });


    const documents =
      (result as any)
        .cursor
        ?.firstBatch ?? [];


    // =========================================================
    // 방장 ID 수집
    // =========================================================

    const ownerIds = [
      ...new Set(

        documents

          .map(
            (conversation: any) =>
              conversation.ownerId
          )

          .filter(
            (id: unknown): id is number =>
              typeof id === "number"
          )

      ),
    ];


    // =========================================================
    // PostgreSQL 방장 프로필 조회
    // =========================================================

    const owners =
      ownerIds.length > 0

        ? await postgresPrisma.myProfile.findMany({

            where: {

              id: {
                in: ownerIds,
              },

            },

            select: {

              id: true,

              name: true,

            },

          })

        : [];


    // =========================================================
    // 방장 Map
    // =========================================================

    const ownerMap =
      new Map(

        owners.map(
          (owner) => [
            owner.id,
            owner.name,
          ]
        )

      );


    // =========================================================
    // 다음 Cursor
    // =========================================================

    let nextCursor:
      CustomChatCursor | null = null;


    if (documents.length === 30) {

      const last =
        documents[
          documents.length - 1
        ];


      const lastMessageAt =
        toISOStringSafe(
          last.lastMessageAt
        );


      const createdAt =
        toISOStringSafe(
          last.createdAt
        );


      if (!createdAt) {

        throw new Error(
          "CUSTOM_CHAT_CURSOR_CREATE_FAILED"
        );

      }


      nextCursor = {

        lastMessageAt,

        memberCount:
          last.memberCount ?? 0,

        createdAt,

        id:
          String(last._id),

      };

    }


    // =========================================================
    // CustomRoom 형태로 변환
    // =========================================================

    const items =
      documents.map(
        (conversation: any) => {

          const createdAt =
            toISOStringSafe(
              conversation.createdAt
            );


          return {

            // CustomRoom
            id:
              String(
                conversation._id
              ),


            title:
              conversation.name ??
              "이름 없는 방",


            desc:
              conversation.description ??
              "",


            ownerId:
              conversation.ownerId ??
              0,


            owner:
              conversation.ownerId != null

                ? ownerMap.get(
                    conversation.ownerId
                  ) ??
                  "(알 수 없음)"

                : "(알 수 없음)",


            members:
              conversation.memberCount ??
              0,


            // password가 null 또는 ""
            // 둘 다 공개방
            isSecret:
              !!conversation.isSecret,


            type:
              "CUSTOM" as const,


            lastMessageAt:
              toISOStringSafe(
                conversation.lastMessageAt
              ),


            createdAt:
              createdAt ?? "",

          };

        }
      );


    return {

      items,

      nextCursor,

    };

  }

  

}


export const chatRoomService =
  new CustomChatRoomService();