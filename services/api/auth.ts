import { request } from '../client';
import { User } from '../../types';

export const authApi = {
    // 登录接口：通常需要验证码 ID 和 验证码值
    login: (data: { username: string; password?: string; captchaKey?: string; captchaCode?: string }) => 
        request.post<User & { token: string }>('/auth/login', data),
        
    // 注册接口
    register: (data: { username: string; email: string; password?: string; code?: string }) =>
        request.post<User>('/auth/register', data),

    // 获取图形验证码
    // 返回结构示例: { key: "uuid", image: "base64..." }
    getCaptcha: () => 
        request.get<{ key: string; image: string }>('/auth/captcha'),

    // 发送邮件验证码
    sendVerifyCode: (email: string) => 
        request.post<{ success: boolean }>('/auth/send-code', { email })
};
