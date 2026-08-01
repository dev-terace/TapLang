// import request from "supertest";
// import app from "../app";
// import { friendsService } from "../services/friends.service";

// jest.mock("../services/friends.service");

// const mockedFriendsService = friendsService as jest.Mocked<
//   typeof friendsService
// >;

// describe("Friends API", () => {

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });


//   test("친구 목록 조회 성공", async () => {
//     mockedFriendsService.getFriends.mockResolvedValue([
//       {
//         id: 2,
//         name: "friend",
//         email: "friend@test.com",
//         flag: "kr",
//         statusMsg: "hello",
//       },
//     ]);


//     const response = await request(app)
//       .get("/api/friends/1");


//     expect(response.status).toBe(200);

//     expect(response.body.message)
//       .toBe("친구 목록 조회 성공");

//     expect(response.body.friends)
//       .toHaveLength(1);


//     expect(
//       mockedFriendsService.getFriends
//     ).toHaveBeenCalledWith(1);

//   });



//   test("친구 등록 성공", async () => {

//     mockedFriendsService.addFriend.mockResolvedValue([
//       {
//         id: 1,
//         ownId: 1,
//         friendId: 2,
//       },
//       {
//         id: 2,
//         ownId: 2,
//         friendId: 1,
//       },
//     ]);


//     const response = await request(app)
//       .post("/api/friends/1/2");


//     expect(response.status).toBe(200);


//     expect(response.body.message)
//       .toBe("친구 등록 성공");


//     expect(
//       mockedFriendsService.addFriend
//     ).toHaveBeenCalledWith(1, 2);

//   });



//   test("친구 조회 실패", async () => {

//     mockedFriendsService.getFriends
//       .mockRejectedValue(
//         new Error("DB Error")
//       );


//     const response = await request(app)
//       .get("/api/friends/1");


//     expect(response.status).toBe(500);


//     expect(response.body.message)
//       .toBe("친구 목록 조회 실패");

//   });


// });