import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/store';
import { Button, Captcha } from '../ui';
import { authApi } from '../../services/api/auth';

export const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 密码强度状态
  const [pwdStrength, setPwdStrength] = useState(0); // 0-4
  
  // 验证码状态
  const [captchaCode, setCaptchaCode] = useState(''); // 用户输入的验证码
  const [captchaKey, setCaptchaKey] = useState('');   // 后端返回的验证码ID
  const [verificationCode, setVerificationCode] = useState(''); // 邮件验证码
  const [timer, setTimer] = useState(0);
  
  // 安全限制状态 (本地简单限制，主要依赖后端)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 计算密码强度
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Za-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPassword(val);
      if (isRegister) {
          setPwdStrength(calculatePasswordStrength(val));
      }
  };

  const handleSendCode = async () => {
      if (!email) {
          showToast('请输入您的邮箱', 'error');
          return;
      }
      if (!email.endsWith('@qq.com')) {
          showToast('仅支持发送验证码到 QQ 邮箱', 'error');
          return;
      }
      
      try {
          // 调用后端真实发送接口
          await authApi.sendVerifyCode(email);
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

    if (!username || !password) {
        showToast('请填写所有字段', 'error');
        return;
    }

    // 注册逻辑
    if (isRegister) {
        if (!email || !verificationCode) {
            showToast('请填写邮箱和验证码', 'error');
            return;
        }
        if (pwdStrength < 3) {
             showToast('密码强度不足：需至少8位，且包含字母和数字', 'error');
             return;
        }

        setLoading(true);
        try {
            await authApi.register({
                username, 
                email, 
                password, 
                code: verificationCode // 邮件验证码
            });
            showToast('注册成功，请登录', 'success');
            setIsRegister(false); // 切换回登录页
        } catch (err: any) {
            showToast(err.message || '注册失败', 'error');
        } finally {
            setLoading(false);
        }
    } 
    // 登录逻辑
    else {
        if (!captchaCode) {
            showToast('请输入图形验证码', 'error');
            return;
        }

        setLoading(true);
        try {
            const userData = await authApi.login({ 
                username, 
                password, 
                captchaKey, 
                captchaCode 
            });
            
            // 登录成功，将 Token 存入 localStorage
            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }
            
            // 刷新页面以更新状态（简化处理）
            window.location.reload(); 
            
            onClose();
        } catch(err: any) {
            showToast(err.message || '登录失败', 'error');
            // 登录失败通常需要刷新验证码
            setCaptchaCode('');
        } finally {
            setLoading(false);
        }
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  // 获取强度对应的颜色和文本
  const getStrengthMeta = () => {
      if (password.length === 0) return { color: 'bg-gray-200', text: '' };
      if (password.length < 8) return { color: 'bg-red-500', text: '太短' };
      
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
        <p className="text-sm text-apple-subtext dark:text-apple-dark-subtext">请输入您的详细信息</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <input 
             type="text" 
             placeholder="用户名" 
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text transition-all disabled:opacity-50"
           />
        </div>

        {isRegister && (
             <div className="space-y-4 animate-in slide-in-from-top-2">
                <input 
                    type="email" 
                    placeholder="邮箱地址 (仅限 QQ 邮箱)" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!isLocked}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                />
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="邮件验证码" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={!!isLocked}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
                    />
                    <Button 
                        type="button" 
                        variant="secondary" 
                        disabled={timer > 0 || !email || !!isLocked}
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
             type="password" 
             placeholder={isRegister ? "密码 (至少8位, 含字母数字)" : "密码"} 
             value={password}
             onChange={handlePasswordChange}
             disabled={!!isLocked}
             className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text disabled:opacity-50"
           />
           {/* 密码强度可视化 */}
           {isRegister && password.length > 0 && (
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

        {/* 登录时显示图形验证码 */}
        {!isRegister && (
            <div className="flex space-x-2 animate-in fade-in">
                <input 
                    type="text" 
                    placeholder="验证码" 
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                />
                <Captcha onRefresh={(key) => setCaptchaKey(key)} />
            </div>
        )}
        
        <Button type="submit" className="w-full shadow-lg shadow-blue-500/20" disabled={loading || !!isLocked}>
          {loading ? '处理中...' : (isLocked ? '已锁定 (1分钟)' : (isRegister ? '注册' : '登录'))}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <button 
          type="button"
          onClick={() => { 
              setIsRegister(!isRegister); 
              setCaptchaCode('');
              setPassword(''); 
              setPwdStrength(0); 
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
