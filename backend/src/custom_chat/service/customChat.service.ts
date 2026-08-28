import { mongoPrisma, postgresPrisma } from "../../lib/prisma";
import { v7 as uuidv7 } from "uuid";
import { ConversationMemberRole } from "../../../generated/mongo";

// =========================================================
// Interfaces & Types
// =========================================================

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

export interface MyCustomChatCursor {
  lastMessageAt: string | null;
  createdAt: string;
  id: string;
}

export interface CustomRoom {
  id: string;
  title: string;
  desc: string;
  ownerId: number;
  owner: string;
  members: number;
  isSecret: boolean;
  type: "CUSTOM";
  lastMessageAt: string | null;
  createdAt: string;
}

// =========================================================
// Helper Utilities
// =========================================================

const toISOStringSafe = (value: unknown): string | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "object" && value !== null && "$date" in value) {
    const dateValue = (value as { $date: unknown }).$date;
    const date = new Date(dateValue as string | number);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

// =========================================================
// Service Implementation
// =========================================================

const toBsonDate = (isoString: string) => ({ $date: isoString });

export class CustomChatRoomService {
  // -------------------------------------------------------
  // Private Helper Methods (Validation & Common Queries)
  // -------------------------------------------------------

  private async assertCustomConversation(conversationId: string) {
    if (!conversationId) throw new Error("CONVERSATION_ID_REQUIRED");

    const conversation = await mongoPrisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, type: true, password: true },
    });

    if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");
    if (conversation.type !== "CUSTOM") throw new Error("NOT_A_CUSTOM_CHAT");

    return conversation;
  }

  private async assertOwner(conversationId: string, userId: number) {
    const requester = await mongoPrisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!requester || requester.role !== ConversationMemberRole.OWNER) {
      throw new Error("FORBIDDEN_NOT_OWNER");
    }

    return requester;
  }

  private async fetchOwnerMap(ownerIds: number[]): Promise<Map<number, string>> {
    if (ownerIds.length === 0) return new Map();

    const owners = await postgresPrisma.myProfile.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true },
    });

    return new Map(owners.map((owner) => [owner.id, owner.name]));
  }

  private mapToCustomRoom(doc: any, ownerMap: Map<number, string>): CustomRoom {
    return {
      id: String(doc._id),
      title: doc.name ?? "이름 없는 방",
      desc: doc.description ?? "",
      ownerId: doc.ownerId ?? 0,
      owner: doc.ownerId != null ? ownerMap.get(doc.ownerId) ?? "(알 수 없음)" : "(알 수 없음)",
      members: doc.memberCount ?? 0,
      isSecret: !!doc.isSecret,
      type: "CUSTOM",
      lastMessageAt: toISOStringSafe(doc.lastMessageAt),
      createdAt: toISOStringSafe(doc.createdAt) ?? "",
    };
  }

  // -------------------------------------------------------
  // Public Domain Methods
  // -------------------------------------------------------

  async getCustomChatMemberIds(conversationId: string): Promise<number[]> {
    await this.assertCustomConversation(conversationId);

    const members = await mongoPrisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    return members.map((m) => m.userId);
  }

  async joinCustomChat(conversationId: string, userId: number) {
    await this.assertCustomConversation(conversationId);

    const existingMember = await mongoPrisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (existingMember) {
      return { conversationId, joined: false, alreadyMember: true };
    }

    const member = await mongoPrisma.conversationMember.create({
      data: {
        conversationId,
        userId,
        role: ConversationMemberRole.MEMBER,
      },
    });

    return {
      conversationId,
      joined: true,
      alreadyMember: false,
      member: {
        id: member.id,
        userId: member.userId,
        role: member.role,
      },
    };
  }

  async createChatInfo({ ownId, name, description, password }: CreateChatParams) {
    if (!name?.trim()) {
      throw new Error("채팅방 이름을 입력하세요.");
    }

    return mongoPrisma.conversation.create({
      data: {
        id: uuidv7(),
        type: "CUSTOM",
        name: name.trim(),
        description: description?.trim() || null,
        password: password?.trim() || null,
        members: {
          create: {
            userId: ownId,
            role: ConversationMemberRole.OWNER,
          },
        },
      },
      include: { members: true },
    });
  }

  async transferOwner(conversationId: string, currentUserId: number, targetUserId: number) {
    await this.assertOwner(conversationId, currentUserId);

    if (currentUserId === targetUserId) {
      throw new Error("CANNOT_TRANSFER_TO_SELF");
    }

    const target = await mongoPrisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: targetUserId },
      },
    });

    if (!target) throw new Error("TARGET_NOT_MEMBER");

    return mongoPrisma.$transaction([
      mongoPrisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId: currentUserId } },
        data: { role: ConversationMemberRole.MEMBER },
      }),
      mongoPrisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId: targetUserId } },
        data: { role: ConversationMemberRole.OWNER },
      }),
    ]);
  }

  async kickMember(conversationId: string, currentUserId: number, targetUserId: number) {
    await this.assertOwner(conversationId, currentUserId);

    if (currentUserId === targetUserId) {
      throw new Error("CANNOT_KICK_SELF");
    }

    const target = await mongoPrisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: targetUserId },
      },
    });

    if (!target) throw new Error("TARGET_NOT_MEMBER");

    return mongoPrisma.conversationMember.delete({
      where: {
        conversationId_userId: { conversationId, userId: targetUserId },
      },
    });
  }

  async getCustomChatMemberCount(conversationId: string): Promise<number> {
    await this.assertCustomConversation(conversationId);

    return mongoPrisma.conversationMember.count({
      where: { conversationId },
    });
  }

  async getCustomChatPassword(conversationId: string): Promise<string | null> {
    const conversation = await this.assertCustomConversation(conversationId);
    return conversation.password;
  }

  async isConversationMember(conversationId: string, userId: number): Promise<boolean> {
    if (!conversationId) throw new Error("CONVERSATION_ID_REQUIRED");
    if (!userId) throw new Error("USER_ID_REQUIRED");

    const member = await mongoPrisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { id: true },
    });

    return member !== null;
  }

  // -------------------------------------------------------
  // Complex Query Methods (Aggregation List)
  // -------------------------------------------------------

  // -------------------------------------------------------
  // Helper Utilities 추가
  // -------------------------------------------------------


  // -------------------------------------------------------
  // Service Implementation 내 수정
  // -------------------------------------------------------

  async getCustomChats(cursor?: CustomChatCursor): Promise<{
    items: CustomRoom[];
    nextCursor: CustomChatCursor | null;
  }> {
    const pipeline: any[] = [
      { $match: { type: "CUSTOM" } },
      {
        $lookup: {
          from: "ConversationMember",
          localField: "_id",
          foreignField: "conversationId",
          as: "members",
        },
      },
      {
        $addFields: {
          memberCount: { $size: "$members" },
          ownerId: {
            $let: {
              vars: {
                owner: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$members",
                        as: "member",
                        cond: { $eq: ["$$member.role", "OWNER"] },
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
      {
        $addFields: {
          isSecret: {
            $and: [
              { $ne: ["$password", null] },
              { $ne: ["$password", ""] },
            ],
          },
        },
      },
      { $project: { members: 0, password: 0 } },
    ];

    if (cursor) {
      const createdAtIso = toISOStringSafe(cursor.createdAt);
      const lastMessageAtIso = cursor.lastMessageAt ? toISOStringSafe(cursor.lastMessageAt) : null;

      if (!createdAtIso || (cursor.lastMessageAt && !lastMessageAtIso)) {
        throw new Error("INVALID_CURSOR");
      }

      // Extended JSON {$date: ...} 형태로 변환하여 BSON Date 비교 보장
      const createdAtBson = toBsonDate(createdAtIso);
      const lastMessageAtBson = lastMessageAtIso ? toBsonDate(lastMessageAtIso) : null;

      if (lastMessageAtBson) {
        pipeline.push({
          $match: {
            $or: [
              { lastMessageAt: { $lt: lastMessageAtBson } },
              { lastMessageAt: lastMessageAtBson, memberCount: { $lt: cursor.memberCount } },
              { lastMessageAt: lastMessageAtBson, memberCount: cursor.memberCount, createdAt: { $lt: createdAtBson } },
              { lastMessageAt: lastMessageAtBson, memberCount: cursor.memberCount, createdAt: createdAtBson, _id: { $lt: cursor.id } },
            ],
          },
        });
      } else {
        pipeline.push({
          $match: {
            $or: [
              { lastMessageAt: null, memberCount: { $lt: cursor.memberCount } },
              { lastMessageAt: null, memberCount: cursor.memberCount, createdAt: { $lt: createdAtBson } },
              { lastMessageAt: null, memberCount: cursor.memberCount, createdAt: createdAtBson, _id: { $lt: cursor.id } },
            ],
          },
        });
      }
    }

    pipeline.push(
      { $sort: { lastMessageAt: -1, memberCount: -1, createdAt: -1, _id: -1 } },
      { $limit: 30 }
    );

    const result = await mongoPrisma.$runCommandRaw({
      aggregate: "Conversation",
      pipeline,
      cursor: {},
    });

    const documents = (result as any).cursor?.firstBatch ?? [];

    const ownerIds = [
      ...new Set<number>(
        documents
          .map((d: any) => d.ownerId)
          .filter(
            (id: unknown): id is number =>
              typeof id === "number"
          )
      )
    ];

    const ownerMap = await this.fetchOwnerMap(ownerIds);

    let nextCursor: CustomChatCursor | null = null;
    if (documents.length === 30) {
      const last = documents[documents.length - 1];
      const lastCreatedAt = toISOStringSafe(last.createdAt);
      if (!lastCreatedAt) throw new Error("CUSTOM_CHAT_CURSOR_CREATE_FAILED");

      nextCursor = {
        lastMessageAt: toISOStringSafe(last.lastMessageAt),
        memberCount: last.memberCount ?? 0,
        createdAt: lastCreatedAt,
        id: String(last._id),
      };
    }

    return {
      items: documents.map((doc: any) => this.mapToCustomRoom(doc, ownerMap)),
      nextCursor,
    };
  }

  async getMyCustomChats(
    userId: number,
    cursor?: MyCustomChatCursor
  ): Promise<{
    items: CustomRoom[];
    nextCursor: MyCustomChatCursor | null;
  }> {
    if (!userId) throw new Error("USER_ID_REQUIRED");

    const pipeline: any[] = [
      { $match: { type: "CUSTOM" } },
      {
        $lookup: {
          from: "ConversationMember",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$conversationId"] },
                    { $eq: ["$userId", userId] },
                  ],
                },
              },
            },
          ],
          as: "myMembership",
        },
      },
      { $match: { "myMembership.0": { $exists: true } } },
      {
        $lookup: {
          from: "ConversationMember",
          localField: "_id",
          foreignField: "conversationId",
          as: "members",
        },
      },
      {
        $addFields: {
          memberCount: { $size: "$members" },
          ownerId: {
            $let: {
              vars: {
                owner: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$members",
                        as: "member",
                        cond: { $eq: ["$$member.role", "OWNER"] },
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
      {
        $addFields: {
          isSecret: {
            $and: [
              { $ne: ["$password", null] },
              { $ne: ["$password", ""] },
            ],
          },
        },
      },
      { $project: { members: 0, myMembership: 0, password: 0 } },
    ];

    if (cursor) {
      const createdAtIso = toISOStringSafe(cursor.createdAt);
      const lastMessageAtIso = cursor.lastMessageAt ? toISOStringSafe(cursor.lastMessageAt) : null;

      if (!createdAtIso || (cursor.lastMessageAt && !lastMessageAtIso)) {
        throw new Error("INVALID_CURSOR");
      }

      // Extended JSON {$date: ...} 형태로 변환하여 BSON Date 비교 보장
      const createdAtBson = toBsonDate(createdAtIso);
      const lastMessageAtBson = lastMessageAtIso ? toBsonDate(lastMessageAtIso) : null;

      if (lastMessageAtBson) {
        pipeline.push({
          $match: {
            $or: [
              { lastMessageAt: { $lt: lastMessageAtBson } },
              { lastMessageAt: lastMessageAtBson, createdAt: { $lt: createdAtBson } },
              { lastMessageAt: lastMessageAtBson, createdAt: createdAtBson, _id: { $lt: cursor.id } },
            ],
          },
        });
      } else {
        pipeline.push({
          $match: {
            $or: [
              { lastMessageAt: null, createdAt: { $lt: createdAtBson } },
              { lastMessageAt: null, createdAt: createdAtBson, _id: { $lt: cursor.id } },
            ],
          },
        });
      }
    }

    pipeline.push(
      { $sort: { lastMessageAt: -1, createdAt: -1, _id: -1 } },
      { $limit: 30 }
    );

    const result = await mongoPrisma.$runCommandRaw({
      aggregate: "Conversation",
      pipeline,
      cursor: {},
    });

    const documents = (result as any).cursor?.firstBatch ?? [];
    const ownerIds = [
      ...new Set<number>(
        documents
          .map((d: any) => d.ownerId)
          .filter(
            (id: unknown): id is number =>
              typeof id === "number"
          )
      )
    ];
    const ownerMap = await this.fetchOwnerMap(ownerIds);

    let nextCursor: MyCustomChatCursor | null = null;
    if (documents.length === 30) {
      const last = documents[documents.length - 1];
      const lastCreatedAt = toISOStringSafe(last.createdAt);
      if (!lastCreatedAt) throw new Error("CUSTOM_CHAT_CURSOR_CREATE_FAILED");

      nextCursor = {
        lastMessageAt: toISOStringSafe(last.lastMessageAt),
        createdAt: lastCreatedAt,
        id: String(last._id),
      };
    }

    return {
      items: documents.map((doc: any) => this.mapToCustomRoom(doc, ownerMap)),
      nextCursor,
    };
  }
}

export const chatRoomService = new CustomChatRoomService();