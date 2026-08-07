import { connectMongoDB } from "../../lib/mongo";
import { postgresPrisma  } from "../../lib/prisma";
import { mongoPrisma  } from "../../lib/prisma";



export const  readConversation = async(
  conversationId: string,
  ownId: number
) => {

  console.log("read conversationId: ", conversationId)
  console.log("read conversation ownId: ", ownId)

  return mongoPrisma.conversationMember.updateMany({
    where: {
      conversationId,
      userId: ownId,
    },
    data: {
      unreadCount: 0,
      lastReadAt: new Date(),
    },
  });
}

export const getMyConversations = async (
  userId: number,
  limit = 20,
  cursor?: {
    lastMessageAt: Date;
    conversationId: string;
  }
) => {

  const db = await connectMongoDB();


  const pipeline: any[] = [

    // 내가 속한 채팅방
    {
      $match: {
        userId
      }
    },


    // Conversation 조회
    {
      $lookup: {
        from: "Conversation",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversation"
      }
    },


    {
      $unwind: "$conversation"
    }

  ];


  // cursor
  if (cursor) {

    pipeline.push({
      $match: {
        $or: [
          {
            "conversation.lastMessageAt": {
              $lt: cursor.lastMessageAt
            }
          },
          {
            "conversation.lastMessageAt": cursor.lastMessageAt,
            "conversation._id": {
              $lt: cursor.conversationId
            }
          }
        ]
      }
    });

  }



  pipeline.push(

    // 멤버 조회
    {
      $lookup: {
        from: "ConversationMember",

        let: {
          cid: "$conversationId"
        },

        pipeline: [

          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq:[
                      "$conversationId",
                      "$$cid"
                    ]
                  },
                  {
                    $ne:[
                      "$userId",
                      userId
                    ]
                  }
                ]
              }
            }
          },


          {
            $limit:4
          },


          {
            $project:{
              _id:0,
              userId:1,
              role:1
            }
          }

        ],

        as:"members"
      }
    },


    // 마지막 메시지
    {
      $lookup:{
        from:"Message",

        localField:
          "conversation.lastMessageId",

        foreignField:"_id",

        as:"lastMessage"
      }
    },


    {
      $unwind:{
        path:"$lastMessage",
        preserveNullAndEmptyArrays:true
      }
    },


    {
      $sort:{
        "conversation.lastMessageAt":-1,
        "conversation._id":-1
      }
    },


    {
      $limit: limit
    },


    {
      $project:{
        _id:0,

        conversationId:"$conversation._id",

        type:"$conversation.type",

        name:"$conversation.name",

        unreadCount:1,

        members:1,


        lastMessage:{
          id:"$lastMessage._id",
          senderId:"$lastMessage.senderId",
          content:"$lastMessage.content",
          attachments:"$lastMessage.attachments",
          createdAt:"$lastMessage.createdAt"
        },


        lastMessageId:
          "$conversation.lastMessageId",

        lastMessageAt:
          "$conversation.lastMessageAt"
      }
    }

  );


  const data =
    await db
      .collection("ConversationMember")
      .aggregate(pipeline)
      .toArray();



  /**
   * 프로필 조회
   */

  const memberIds = [
    ...new Set(
      data.flatMap(room =>
        room.members.map(
          (member:any)=>member.userId
        )
      )
    )
  ];



  const profiles =
    await postgresPrisma.myProfile.findMany({

      where:{
        id:{
          in:memberIds
        }
      },

      select:{
        id:true,
        name:true,
        flag:true
      }

    });



  const profileMap = new Map(
    profiles.map(profile=>[
      profile.id,
      profile
    ])
  );



  /**
   * 응답 데이터 재구성
   */

  const result =
    data.map(room=>({

      ...room,

      members:
        room.members.map((member:any)=>({

          userId:member.userId,

          role:member.role,

          name:
            profileMap.get(member.userId)?.name ?? "",

          flag:
            profileMap.get(member.userId)?.flag ?? ""

        }))

    }));



  const last =
    result[result.length-1];


  const nextCursor =
    last
    ? {
        lastMessageAt:
          last.lastMessageAt,

        conversationId:
          last.conversationId
      }
    : null;



  return {
    data:result,
    nextCursor
  };

};

export const getConversationUnreadCounts = async (
  userId: number
) => {
  const db = await connectMongoDB();

  console.log("userId: ", userId);
  console.log("userId Type ", typeof userId);

  const result = await db
    .collection("ConversationMember")
    .aggregate([
      // 1. 내가 속한 채팅방만 조회
      {
        $match: {
          userId,
        },
      },

      // 2. Message 조회
      {
        $lookup: {
          from: "Message",
          let: {
            conversationId: "$conversationId",
            lastReadAt: "$lastReadAt",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$conversationId",
                        "$$conversationId",
                      ],
                    },
                    {
                      $gt: [
                        "$createdAt",
                        "$$lastReadAt",
                      ],
                    },
                  ],
                },
              },
            },

            // count만 가져오기
            {
              $count: "count",
            },
          ],
          as: "unread",
        },
      },

      // 3. unread 배열 -> 숫자로 변환
      {
        $addFields: {
          unreadCount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$unread.count",
                  0,
                ],
              },
              0,
            ],
          },
        },
      },

      // 4. 필요한 데이터만 반환
      {
        $project: {
          _id: 0,
          conversationId: 1,
          lastReadAt: 1,
          unreadCount: 1,
        },
      },
    ])
    .toArray();

  return result;
};

export const chatService = {
  getConversationUnreadCounts,
  getMyConversations,
  readConversation
}