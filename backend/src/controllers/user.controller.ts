import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export const loginOrRegister = async (req: Request, res: Response) => {
  try {
    const { provider, providerId, email, name, flag, statusMsg } = req.body;

    // 필수 항목 검증
    if (!provider || !providerId || !email || !name) {
      return res.status(400).json({ error: '소셜 로그인 필수 정보가 누락되었습니다.' });
    }

    // 서비스 호출 (조회 또는 생성)
    const { user, isNew } = await userService.findOrCreateUser({
      provider,
      providerId,
      email,
      name,
      flag,
      statusMsg,
    });

    // 신규 생성되었으면 201 Created, 기존 유저면 200 OK
    const statusCode = isNew ? 201 : 200;

    res.status(statusCode).json({
      message: isNew ? '신규 회원가입이 완료되었습니다.' : '로그인 성공',
      isNew,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
};