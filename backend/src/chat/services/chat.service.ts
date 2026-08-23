import { connectMongoDB } from "../../lib/mongo";
import { postgresPrisma } from "../../lib/prisma";
import { mongoPrisma } from "../../lib/prisma";

export const readConversation = async (
  conversationId: string,
  ownIdInput: number
) => {
  const ownId = Number(ownIdInput);

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
};

export const getMyConversations = async (
  userIdInput: number,
  limit = 20,
  cursor?: {
    lastMessageAt: Date | string;
    conversationId: string;
  },
  blockedUserIds: number[] = []
) => {
  const userId = Number(userIdInput);
  const db = await connectMongoDB();

  const pipeline: any[] = [
    { $match: { userId } },
    {
      $lookup: {
        from: "Conversation",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversation",
      },
    },
    { $unwind: "$conversation" },
    {
      $match: {
        "conversation.type": { $in: ["DIRECT", "GROUP"] },
      },
    },
  ];

  if (cursor) {
    const cursorDate = new Date(cursor.lastMessageAt);
    pipeline.push({
      $match: {
        $or: [
          { "conversation.lastMessageAt": { $lt: cursorDate } },
          {
            "conversation.lastMessageAt": cursorDate,
            "conversation._id": { $lt: cursor.conversationId },
          },
        ],
      },
    });
  }
  

  pipeline.push(
    {
      $lookup: {
        from: "ConversationMember",
        let: { cid: "$conversationId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$conversationId", "$$cid"] },
                  { $ne: ["$userId", userId] },
                  { $not: [{ $in: ["$userId", blockedUserIds] }] },
                ],
              },
            },
          },
          { $limit: 4 },
          { $project: { _id: 0, userId: 1, role: 1 } },
        ],
        as: "members",
      },
    },
    {
      $match: {
        $expr: {
          $or: [
            { $eq: ["$conversation.type", "GROUP"] },
            {
              $and: [
                { $eq: ["$conversation.type", "DIRECT"] },
                { $gt: [{ $size: "$members" }, 0] },
              ],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "Message",
        localField: "conversation.lastMessageId",
        foreignField: "_id",
        as: "lastMessage",
      },
    },
    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "conversation.lastMessageAt": -1,
        "conversation._id": -1,
      },
    },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        conversationId: "$conversation._id",
        type: "$conversation.type",
        name: "$conversation.name",
        directKey: "$conversation.directKey",
        unreadCount: 1,
        members: 1,
        lastMessage: {
          id: "$lastMessage._id",
          senderId: "$lastMessage.senderId",
          content: "$lastMessage.content",
          attachments: "$lastMessage.attachments",
          createdAt: "$lastMessage.createdAt",
        },
        lastMessageId: "$conversation.lastMessageId",
        lastMessageAt: "$conversation.lastMessageAt",
      },
    }
  );

  // ✅ 여기가 빠져있던 부분 — 실행 + 프로필 병합 + 반환

  const data = await db
    .collection("ConversationMember")
    .aggregate(pipeline)
    .toArray();

 console.log(data.map(d => ({ id: d.conversationId, lastMessageAt: d.lastMessageAt })));

  const memberIds = [
    ...new Set([
      userId,
      ...data.flatMap((room) => {
        const ids = room.members.map((member: any) => member.userId);
        if (room.type === "DIRECT" && room.directKey) {
          const opponentId = room.directKey
            .split(":")
            .map(Number)
            .find((id: number) => id !== userId);
          if (opponentId) ids.push(opponentId);
        }
        return ids;
      }),
    ]),
  ];

  const profiles = await postgresPrisma.myProfile.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, name: true, flag: true },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const result = data.map((room) => {
    let formattedMembers = room.members.map((member: any) => ({
      userId: member.userId,
      role: member.role,
      name: profileMap.get(member.userId)?.name ?? "(퇴장한 사용자)",
      flag: profileMap.get(member.userId)?.flag ?? "",
      isLeft: false,
    }));

    if (room.type === "DIRECT" && formattedMembers.length === 0 && room.directKey) {
      const opponentId = room.directKey
        .split(":")
        .map(Number)
        .find((id: number) => id !== userId);

      if (opponentId) {
        const opponentProfile = profileMap.get(opponentId);
        formattedMembers = [
          {
            userId: opponentId,
            role: "MEMBER",
            name: opponentProfile?.name ?? "(알 수 없음)",
            flag: opponentProfile?.flag ?? "",
            isLeft: true,
          },
        ];
      }
    }

    if (room.type === "GROUP" && formattedMembers.length === 0) {
      const myProfile = profileMap.get(userId);
      formattedMembers = [
        {
          userId,
          role: "MEMBER",
          name: myProfile?.name ?? "(나)",
          flag: myProfile?.flag ?? "",
          isLeft: false,
        },
      ];
    }

    let displayName = room.name;
    if (room.type === "GROUP" && (!displayName || displayName.trim() === "")) {
      displayName =
        formattedMembers.length > 0
          ? formattedMembers.map((m) => m.name).join(", ")
          : "(대화 상대 없음)";
    }

    return {
      ...room,
      name: displayName,
      members: formattedMembers,
      activeMemberCount: formattedMembers.length,
    };
  });

  const last = result[result.length - 1];

  return {
    data: result,
    nextCursor: last
      ? {
          lastMessageAt: last.lastMessageAt,
          conversationId: last.conversationId,
        }
      : null,
  };
};

export const getConversationUnreadCounts = async (userIdInput: number) => {
  const userId = Number(userIdInput);
  const db = await connectMongoDB();

  const result = await db
    .collection("ConversationMember")
    .aggregate([
      {
        $match: {
          userId,
        },
      },
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
                    { $eq: ["$conversationId", "$$conversationId"] },
                    { $gt: ["$createdAt", "$$lastReadAt"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unread",
        },
      },
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0],
          },
        },
      },
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
  readConversation,

};