import { connectMongoDB } from "../../lib/mongo";
import cron from "node-cron";


export const cleanupGhostRooms = async (olderThanMs = 60 * 60 * 1000) => {
  const db = await connectMongoDB();
  const cutoff = new Date(Date.now() - olderThanMs);

  const ghostRooms = await db
    .collection("Conversation")
    .find({
      lastMessageId: { $exists: false },
      createdAt: { $lt: cutoff },
    })
    .project({ _id: 1 })
    .toArray();

  if (ghostRooms.length === 0) {
    return { deletedCount: 0 };
  }

  const ghostIds = ghostRooms.map((r) => r._id);

  await db
    .collection("ConversationMember")
    .deleteMany({ conversationId: { $in: ghostIds } });

  const result = await db
    .collection("Conversation")
    .deleteMany({ _id: { $in: ghostIds } });

  console.log(`[cleanupGhostRooms] ${result.deletedCount}개 유령 방 삭제`);

  return { deletedCount: result.deletedCount };
};



  // 매일 새벽 4시에 실행
  cron.schedule("0 4 * * *", async () => {
    try {
      const result = await cleanupGhostRooms();
      console.log("[스케줄러] 유령 방 정리 완료:", result);
    } catch (error) {
      console.error("[스케줄러] 유령 방 정리 실패:", error);
    }
  });
