import { postgresPrisma as prisma } from "../../lib/prisma";
import sanitizeHtml from "sanitize-html";


const ADMIN_PROVIDER_ID = process.env.ADMIN_PROVIDER_ID;


// XSS 방어용 HTML 필터링 옵션
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
    "nl", "li", "b", "i", "strong", "em", "strike", "s", "del", "code", "hr", "br", "div",
    "span", "pre", "u", "mark", "font", // 💡 s, del, font 태그 추가
    "table", "thead", "tbody", "tfoot", "tr", "th", "td"
  ],
  allowedAttributes: {
    // 💡 에디터가 정렬, 색상 등에 사용하는 style 속성을 주요 태그에 모두 허용
    "*": ["style", "class"],
    "a": ["href", "name", "target"],
    "font": ["color", "size", "face"],
  },
allowedStyles: {
  "*": {
    "color": [
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      /^rgb\(/,
      /^rgba\(/,
      /^[a-zA-Z]+$/
    ],

    "background-color": [
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      /^rgb\(/,
      /^rgba\(/,
      /^[a-zA-Z]+$/
    ],

    "text-align": [
      /^left$/,
      /^right$/,
      /^center$/,
      /^justify$/
    ],

    "font-size": [
      /^\d+(px|em|rem|pt)$/
    ],

    // 테이블
    "border": [
      /^\d+px\s+(solid|dashed|dotted)\s+(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|[a-zA-Z]+)$/
    ],

    "border-collapse": [
      /^collapse$/,
      /^separate$/
    ],

    "width": [
      /^\d+%$/,
      /^\d+px$/
    ]
  },
},
  allowedSchemes: ["http", "https", "mailto"],
};

export const noticeService = {
  // 관리자 권한 확인 함수
async checkAdminPermission(userId: number): Promise<boolean> {
  const profile = await prisma.myProfile.findUnique({
    where: { id: userId },
    select: { providerId: true },
  });
  
  // 💡 [원인 1] .env가 안 읽혔거나, 숫자형 vs 문자열 차이로 false가 날 수 있음
  return String(profile?.providerId) === String(ADMIN_PROVIDER_ID);
  },

  async getNotices() {
    return await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async createNotice(userId: number, data: { title: string; content: string; isUrgent?: boolean }) {
    const isAdmin = await this.checkAdminPermission(userId);
    if (!isAdmin) throw new Error("FORBIDDEN");

    const cleanContent = sanitizeHtml(data.content, sanitizeOptions);

    return await prisma.notice.create({
      data: {
        title: data.title,
        content: cleanContent,
        isUrgent: data.isUrgent || false,
      },
    });
  },

  async updateNotice(userId: number, noticeId: number, data: { title: string; content: string; isUrgent?: boolean }) {
    const isAdmin = await this.checkAdminPermission(userId);
    if (!isAdmin) throw new Error("FORBIDDEN");

    const cleanContent = sanitizeHtml(data.content, sanitizeOptions);

    return await prisma.notice.update({
      where: { id: noticeId },
      data: {
        title: data.title,
        content: cleanContent,
        isUrgent: data.isUrgent,
      },
    });
  },

  async deleteNotice(userId: number, noticeId: number) {
    const isAdmin = await this.checkAdminPermission(userId);
    if (!isAdmin) throw new Error("FORBIDDEN");

    return await prisma.notice.delete({
      where: { id: noticeId },
    });
  },
};