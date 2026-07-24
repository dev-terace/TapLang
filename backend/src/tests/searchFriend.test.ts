import { prisma } from "../lib/prisma";
import { searchFriend } from "../services/friends.service";

describe("searchFriend", () => {
  beforeAll(async () => {
    await prisma.myProfile.create({
      data: {
        provider: "google",
        providerId: "test-provider-id",
        email: "test@test.com",
        name: "홍길동",
        flag: "KR",
        statusMsg: "안녕하세요",
      },
    });
  });

  afterAll(async () => {
    await prisma.myProfile.delete({
      where: {
        email: "test@test.com",
      },
    });

    await prisma.$disconnect();
  });

  it("이름으로 친구를 정확히 검색한다", async () => {
    const result = await searchFriend("홍길동");

    expect(result).not.toBeNull();
    expect(result?.name).toBe("홍길동");
    expect(result?.flag).toBe("KR");
    expect(result?.statusMsg).toBe("안녕하세요");
  });
});