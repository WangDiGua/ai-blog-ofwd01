import React, { useState } from 'react';
import { Card, Button, Avatar, Modal } from '../components/ui';
import { useStore } from '../context/store';
import { systemApi } from '../services/api';
import { Copy, Mail, Send, CheckCircle, AtSign, Link as LinkIcon, Image as ImageIcon, PenTool, ExternalLink, AlertTriangle } from 'lucide-react';

const MY_SITE_INFO = {
    name: 'iBlog',
    url: 'https://iblog.app',
    avatar: 'https://iblog.app/logo.png',
    desc: '用像素和爱构建数字体验。'
};

const FriendLinkCard = ({ name, url, avatar, desc, onClick }: any) => (
    <div onClick={() => onClick(url)} className="group block cursor-pointer">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-start space-x-4">
            <Avatar src={avatar} alt={name} size="md" className="group-hover:rotate-12 transition-transform duration-300" />
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-apple-text dark:text-apple-dark-text group-hover:text-apple-blue transition-colors truncate flex items-center">
                    {name} 
                    <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{desc}</p>
            </div>
        </div>
    </div>
);

export const FriendLinks = () => {
    const { showToast, requireAuth } = useStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', url: '', avatar: '', desc: '' });
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

    // 模拟已有友链
    const links = [
        { name: 'React 官方', url: 'https://react.dev', avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png', desc: '用于构建 Web 和原生交互界面的库' },
        { name: 'Tailwind CSS', url: 'https://tailwindcss.com', avatar: 'https://pic1.zhimg.com/v2-8e6df6459345c22530c34e00b86a3471_720w.jpg?source=172ae18b', desc: '只需 HTML 即可快速构建现代网站' },
        { name: 'Vite', url: 'https://vitejs.dev', avatar: 'https://vitejs.dev/logo.svg', desc: '下一代前端开发与构建工具' },
    ];

    const copyInfo = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.url) {
            showToast('请至少填写网站名称和地址', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await systemApi.applyFriendLink(formData);
            showToast('申请已发送，请等待博主审核！', 'success');
            setIsFormOpen(false);
            setFormData({ name: '', url: '', avatar: '', desc: '' });
        } catch (e) {
            showToast('申请失败，请稍后重试', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLinkClick = (url: string) => {
        setRedirectUrl(url);
    };

    const confirmRedirect = () => {
        if (redirectUrl) {
            window.open(redirectUrl, '_blank');
            setRedirectUrl(null);
        }
    };

    const handleOpenForm = () => {
        requireAuth(() => {
            setIsFormOpen(true);
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 mb-20">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-3xl md:text-5xl font-bold text-apple-text dark:text-apple-dark-text tracking-tight mb-4">
                    友情链接
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    海内存知己，天涯若比邻。欢迎交换友链，共同构建开放的互联网。
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* 左侧：信息与列表 */}
                <div className="lg:col-span-7 space-y-10">
                    
                    {/* 本站信息卡片 */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 md:p-8 border border-blue-100 dark:border-blue-800">
                        <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-6 flex items-center">
                            <AtSign size={20} className="mr-2 text-apple-blue" /> 
                            本站信息
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="text-sm">
                                        <span className="text-gray-400 text-xs block">Name</span>
                                        <span className="font-medium">{MY_SITE_INFO.name}</span>
                                    </div>
                                    <button onClick={() => copyInfo(MY_SITE_INFO.name)} className="text-gray-400 hover:text-apple-blue"><Copy size={16}/></button>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="text-sm">
                                        <span className="text-gray-400 text-xs block">Link</span>
                                        <span className="font-medium">{MY_SITE_INFO.url}</span>
                                    </div>
                                    <button onClick={() => copyInfo(MY_SITE_INFO.url)} className="text-gray-400 hover:text-apple-blue"><Copy size={16}/></button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="text-sm">
                                        <span className="text-gray-400 text-xs block">Avatar</span>
                                        <span className="font-medium truncate max-w-[120px]">{MY_SITE_INFO.avatar}</span>
                                    </div>
                                    <button onClick={() => copyInfo(MY_SITE_INFO.avatar)} className="text-gray-400 hover:text-apple-blue"><Copy size={16}/></button>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="text-sm">
                                        <span className="text-gray-400 text-xs block">Desc</span>
                                        <span className="font-medium truncate max-w-[120px]">{MY_SITE_INFO.desc}</span>
                                    </div>
                                    <button onClick={() => copyInfo(MY_SITE_INFO.desc)} className="text-gray-400 hover:text-apple-blue"><Copy size={16}/></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 现有友链 */}
                    <div>
                        <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text mb-6">小伙伴们</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {links.map((link, idx) => (
                                <FriendLinkCard key={idx} {...link} onClick={handleLinkClick} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 右侧：申请交互 */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24 min-h-[400px] flex items-center justify-center">
                        
                        {/* 状态 1: 信封 (未打开) */}
                        {!isFormOpen && (
                            <div 
                                onClick={handleOpenForm}
                                className="relative cursor-pointer group animate-in zoom-in duration-500"
                            >
                                <div className="w-64 h-48 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/40 rounded-xl shadow-2xl flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 border border-orange-200 dark:border-orange-800">
                                    <Mail size={64} className="text-orange-500/50 group-hover:text-orange-500 transition-colors" />
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-apple-blue text-white rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                                        +
                                    </div>
                                </div>
                                <div className="text-center mt-8">
                                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">申请友链</p>
                                    <p className="text-sm text-gray-400">点击信封，投递你的名片（需登录）</p>
                                </div>
                            </div>
                        )}

                        {/* 状态 2: 表单 (打开) */}
                        {isFormOpen && (
                            <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-10 fade-in duration-500">
                                <h3 className="text-xl font-bold text-center mb-6 text-apple-text dark:text-apple-dark-text">申请友链</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <AtSign size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-apple-blue transition-all border border-transparent focus:bg-white dark:focus:bg-gray-900"
                                            placeholder="网站名称"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-apple-blue transition-all border border-transparent focus:bg-white dark:focus:bg-gray-900"
                                            placeholder="网站地址 (https://...)"
                                            value={formData.url}
                                            onChange={e => setFormData({...formData, url: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-apple-blue transition-all border border-transparent focus:bg-white dark:focus:bg-gray-900"
                                            placeholder="头像地址 (可选)"
                                            value={formData.avatar}
                                            onChange={e => setFormData({...formData, avatar: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <PenTool size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <textarea 
                                            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-apple-blue transition-all border border-transparent focus:bg-white dark:focus:bg-gray-900 resize-none h-24"
                                            placeholder="一句话介绍 (可选)"
                                            value={formData.desc}
                                            onChange={e => setFormData({...formData, desc: e.target.value})}
                                        />
                                    </div>

                                    <div className="flex space-x-3 pt-2">
                                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsFormOpen(false)}>取消</Button>
                                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                            {isSubmitting ? '发送中...' : '提交申请'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* 安全跳转提示弹窗 */}
            <Modal isOpen={!!redirectUrl} onClose={() => setRedirectUrl(null)} title="外链跳转提示">
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">即将离开本站</h3>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        <p>您即将前往外部网站：</p>
                        <div className="my-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-apple-blue font-mono break-all text-xs">
                            {redirectUrl}
                        </div>
                        <p>请注意保护个人隐私和财产安全，谨防诈骗。</p>
                    </div>
                    <div className="flex space-x-4 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setRedirectUrl(null)}>取消</Button>
                        <Button className="flex-1" onClick={confirmRedirect}>继续前往</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};