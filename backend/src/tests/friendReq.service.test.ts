// import { findRequestFriends } from "../friends/services/friendReq.service";
// import { PrismaClient as prisma } from "../../generated/postgres";

// jest.mock("../lib/prisma", () => ({
//   prisma: {
//     friendRequest: {
//       findMany: jest.fn(),
//     },
//   },
// }));


// describe("findFriendRequest", () => {
//   it("senderId 또는 receiverId가 userId인 친구 요청을 반환한다", async () => {
//     const userId = 1;

//     const mockRequests = [
//       {
//         id: 1,
//         senderId: 1,
//         receiverId: 2,
//         createdAt: new Date(),

//         sender: {
//           id: 1,
//           name: "철수",
//           email: "chul@example.com",
//         },

//         receiver: {
//           id: 2,
//           name: "영희",
//           email: "young@example.com",
//         },
//       },
//     ];

//     (prisma.friendRequest.findMany as jest.Mock)
//       .mockResolvedValue(mockRequests);

//     const result = await findFriendRequest(userId);

//     expect(prisma.friendRequest.findMany)
//       .toHaveBeenCalledWith({
//         where: {
//           OR: [
//             {
//               senderId: userId,
//             },
//             {
//               receiverId: userId,
//             },
//           ],
//         },
//         include: {
//           sender: true,
//           receiver: true,
//         },
//       });

//     expect(result).toEqual(mockRequests);
//     expect(result).toHaveLength(1);
//   });
// });