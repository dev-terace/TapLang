import { getSocketIO, userSockets } from "../../socket/socket";
import { chatRoomService } from "../service/customChat.service";
import { userService } from "../../users/services/user.service";

const emitMemberCount = async (
    conversationId: string
) => {
    const io = getSocketIO()

    const memberCount =
        await chatRoomService.getCustomChatMemberCount(
            conversationId
        )

    io.to(`conversation:${conversationId}`)
        .emit(
            "custom-chat-room:members:rendering",
            {
                conversationId,
                memberCount
            }
        )
}

export const joinedConversation = async (
    conversationId: string
) => {
    await emitMemberCount(conversationId)
}

export const kickedMemberProc = async (
    conversationId: string,
    targetId: number
) => {

    const io = getSocketIO()
    await emitMemberCount(conversationId)

    io.to(`user:${targetId}`)
        .emit(
            "custom-chat-room:kicked",
            {
                kicked: true
            }
        )
}

export const transferredOwner = async (
    conversationId: string,
    targetId: number
) => {
    const io = getSocketIO()


    const targetUser = await userService.findUserById(targetId)

    if (targetUser) {
        io.to(`conversation:${conversationId}`)
            .emit(
                "custom-chat-room:owner:rendering",
                {
                    conversationId,
                    ownerId: targetId,
                    ownerName: targetUser.name
                }
            )
    }
}