import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/store';
import { Button, Captcha } from '../ui';
import { authApi } from '../../services/api/auth';
import { z } from 'zod';

// --- Zod Validation Schemas ---

const loginSchema = z.object({
  username: z.string().min(3, "用户名至少3个字符").max(20, "用户名不能超过20字符").regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  password: z.string().min(1, "请输入密码"),
  captchaCode: z.string().length(4, "图形验证码必须是4位"),
});

const registerSchema = z.object({
  username: z.string().min(3, "用户名至少3个字符").max(20, "用户名不能超过20字符").regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  email: z.string().email("请输入有效的邮箱地址").refine(val => val.endsWith('@qq.com'), "目前仅支持 QQ 邮箱注册"),
  password: z.string()
    .min(8, "密码至少8位")
    .regex(/[A-Za-z]/, "密码需包含字母")
    .regex(/[0-9]/, "密码需包含数字")
    .regex(/[^A-Za-z0-9]/, "密码需包含特殊字符"),
  code: z.string().length(6, "邮件验证码必须是6位"),
  captchaCode: z.string().length(4, "图形验证码必须是4位"),
});

export const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      username: '',
      password: '',
      email: '',
      captchaCode: '', // 图形验证码
      verificationCode: '' // 邮件验证码
  });

  const [loading, setLoading] = useState(false);
  const [captchaKey, setCaptchaKey] = useState('');   // 后端返回的验证码ID
  const [timer, setTimer] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      // 简单的去空格处理
      setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  // 密码强度计算 (仅用于 UI 展示)
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Za-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };
  const pwdStrength = calculatePasswordStrength(formData.password);

  const handleSendCode = async () => {
      // 局部校验邮箱
      const emailResult = z.string().email().refine(v => v.endsWith('@qq.com')).safeParse(formData.email);
      if (!emailResult.success) {
          showToast('请输入有效的 QQ 邮箱', 'error');
          return;
      }
      
      try {
          // 调用后端真实发送接口
          await authApi.sendVerifyCode(formData.email);
          setTimer(60);
          showToast('验证码已发送至您的邮箱！', 'success');
      } catch (e: any) {
          showToast(e.message || '发送失败，请稍后重试', 'error');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查本地锁定
    if (lockoutUntil) {
        const now = Date.now();
        if (now < lockoutUntil) {
            const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
            showToast(`操作过于频繁，请 ${remainingSeconds} 秒后再试`, 'error');
            return;
        } else {
            setLockoutUntil(null);
        }
    }

    setLoading(true);

    try {
        if (isRegister) {
            // Validate Registration
            const result = registerSchema.safeParse({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                code: formData.verificationCode,
                captchaCode: formData.captchaCode
            });

            if (!result.success) {
                const errorMsg = result.error.issues[0].message;
                showToast(errorMsg, 'error');
                setLoading(false);
                return;
            }

            await authApi.register({
                username: formData.username, 
                email: formData.email, 
                password: formData.password, 
                code: formData.verificationCode,
                captchaKey,
                captchaCode: formData.captchaCode
            });
            showToast('注册成功，请登录', 'success');
            setIsRegister(false); // 切换回登录页

        } else {
            // Validate Login
            const result = loginSchema.safeParse({
                username: formData.username,
                password: formData.password,
                captchaCode: formData.captchaCode
            });

            if (!result.success) {
                const errorMsg = result.error.issues[0].message;
                showToast(errorMsg, 'error');
                setLoading(false);
                return;
            }

            const userData = await authApi.login({ 
                username: formData.username, 
                password: formData.password, 
                captchaKey, 
                captchaCode: formData.captchaCode 
            });
            
            // 登录成功，将 Token 存入 localStorage
            if (userData.token) {
                // 安全实践：HttpOnly cookie 应该由服务器设置
                // 但这里我们存入 localStorage 作为演示，注意 XSS 风险
                localStorage.setItem('token', userData.token);
            }
            
            // 刷新页面以更新状态（简化处理）
            window.location.reload(); 
            onClose();
        }
    } catch (err: any) {
        showToast(err.message || (isRegister ? '注册失败' : '登录失败'), 'error');
        // 登录失败通常需要刷新验证码
        setFormData(prev => ({ ...prev, captchaCode: '' }));
        // 简单的防爆破策略：失败后增加小延迟
        setLockoutUntil(Date.now() + 2000); 
    } finally {
        setLoading(false);
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  // 获取强度对应的颜色和文本
  const getStrengthMeta = () => {
      if (formData.password.length === 0) return { color: 'bg-gray-200', text: '' };
      if (formData.password.length < 8) return { color: 'bg-red-500', text: '太短' };
      
      switch (pwdStrength) {
          case 1: 
          case 2: return { color: 'bg-red-500', text: '弱' };
          case 3: return { color: 'bg-yellow-500', text: '中' };
          case 4: return { color: 'bg-green-500', text: '强' };
          default: return { color: 'bg-gray-200', text: '' };
      }
  };
  
  const strengthMeta = getStrengthMeta();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">{isRegister ? '创建账户' : '欢迎回来'}</h2>
        <p className="text-sm text-apple-subtext dark:text-apple-dark-text">请输入您的详细信息</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* 隐藏的 input，用于欺骗浏览器自动填充机制 */}
        <input type="text" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />

        <div>
           <input 
             name="username"
             type="text" 
             placeholder="用户名 (字母数字下划线)" 
             value={formData.username}
             onChange={handleChange}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text transition-all disabled:opacity-50"
             maxLength={20}
             autoComplete="off"
           />
        </div>

        {isRegister && (
             <div className="space-y-4 animate-in slide-in-from-top-2">
                <input 
                    name="email"
                    type="email" 
                    placeholder="邮箱地址 (仅限 QQ 邮箱)" 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!isLocked}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                    autoComplete="off"
                />
                <div className="flex space-x-2">
                    <input 
                        name="verificationCode"
                        type="text" 
                        placeholder="邮件验证码" 
                        value={formData.verificationCode}
                        onChange={handleChange}
                        disabled={!!isLocked}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                        maxLength={6}
                        autoComplete="off"
                    />
                    <Button 
                        type="button" 
                        variant="secondary" 
                        disabled={timer > 0 || !formData.email || !!isLocked}
                        onClick={handleSendCode}
                        className="w-24 whitespace-nowrap text-xs"
                    >
                        {timer > 0 ? `${timer}s` : '获取'}
                    </Button>
                </div>
             </div>
        )}

        <div>
           <input 
             name="password"
             type="password" 
             placeholder={isRegister ? "密码 (8+位, 含特殊字符)" : "密码"} 
             value={formData.password}
             onChange={handleChange}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
             autoComplete="new-password"
           />
           {/* 密码强度可视化 */}
           {isRegister && formData.password.length > 0 && (
               <div className="mt-2 flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
                   <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                       <div 
                           className={`h-full transition-all duration-300 ${strengthMeta.color}`} 
                           style={{ width: `${Math.min((pwdStrength / 4) * 100, 100)}%` }}
                       />
                   </div>
                   <span className={`text-xs font-medium ${strengthMeta.color.replace('bg-', 'text-')}`}>
                       {strengthMeta.text}
                   </span>
               </div>
           )}
        </div>

        {/* 图形验证码 (登录和注册都显示) */}
        <div className="flex space-x-2 animate-in fade-in">
            <input 
                name="captchaCode"
                type="text" 
                placeholder="图形验证码" 
                value={formData.captchaCode}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                maxLength={4}
                autoComplete="off"
            />
            <Captcha onRefresh={(key) => setCaptchaKey(key)} />
        </div>
        
        <Button type="submit" className="w-full shadow-lg shadow-blue-500/20" disabled={loading || !!isLocked}>
          {loading ? '处理中...' : (isLocked ? '已锁定 (1分钟)' : (isRegister ? '注册' : '登录'))}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <button 
          type="button"
          onClick={() => { 
              setIsRegister(!isRegister); 
              setFormData({ username: '', password: '', email: '', captchaCode: '', verificationCode: '' });
              setLockoutUntil(null);
          }}
          className="text-apple-blue font-semibold hover:underline"
        >
          {isRegister ? '切换到登录' : '切换到注册'}
        </button>
      </div>
    </div>
  );
};