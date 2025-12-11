import React, { useState } from 'react';
import { Avatar, Button, Card, Modal, Img } from '../components/ui';
import { Gift, Coffee, Upload, User as UserIcon, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../context/store';
import { userApi } from '../services/api';
import { validateImage } from '../utils/lib';

// 模拟打赏数据
const DONORS = [
    { id: 1, name: 'Alice', amount: '¥66.6', avatar: 'https://ui-avatars.com/api/?name=Alice&background=FF5733&color=fff' },
    { id: 2, name: 'Bob Tech', amount: '¥88.8', avatar: 'https://ui-avatars.com/api/?name=Bob&background=33FF57&color=fff' },
    { id: 3, name: 'Charlie', amount: '¥6.66', avatar: 'https://ui-avatars.com/api/?name=Charlie&background=3357FF&color=fff' },
    { id: 4, name: 'David', amount: '¥50.0', avatar: 'https://ui-avatars.com/api/?name=David&background=F39C12&color=fff' },
    { id: 5, name: 'Eva Design', amount: '¥100', avatar: 'https://ui-avatars.com/api/?name=Eva&background=8E44AD&color=fff' },
    { id: 6, name: 'Frank', amount: '¥20', avatar: 'https://ui-avatars.com/api/?name=Frank&background=E74C3C&color=fff' },
];

const DonationFormModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { user, showToast } = useStore();
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [useCustomAvatarFile, setUseCustomAvatarFile] = useState(true);

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validation = validateImage(file);
            if (!validation.valid) {
                showToast(validation.error || '无效图片', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setScreenshot(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validation = validateImage(file);
            if (!validation.valid) {
                showToast(validation.error || '无效图片', 'error');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                if(ev.target?.result) setAvatarUrl(ev.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!screenshot) {
            showToast('请上传打赏记录截图', 'error');
            return;
        }

        if (!user && !nickname.trim()) {
            showToast('请填写您的昵称', 'error');
            return;
        }

        setLoading(true);
        try {
            await userApi.submitDonation({
                userId: user?.id,
                nickname: user ? user.name : nickname,
                avatar: user ? user.avatar : (avatarUrl || 'https://ui-avatars.com/api/?name=Guest&background=random'),
                screenshot: screenshot
            });
            showToast('提交成功，感谢您的支持！审核通过后将展示。', 'success');
            onClose();
            // Reset form
            setNickname('');
            setAvatarUrl('');
            setScreenshot(null);
            setAvatarFile(null);
        } catch (error) {
            showToast('提交失败，请稍后重试', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="上传打赏记录">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start space-x-3">
                    <Coffee className="text-blue-500 shrink-0 mt-1" size={20} />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-bold mb-1">感谢支持！</p>
                        <p>您的慷慨解囊是我持续创作的最大动力。请填写信息并上传截图，我会尽快审核。</p>
                    </div>
                </div>

                {user ? (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <Avatar src={user.avatar} alt={user.name} size="lg" />
                        <div>
                            <p className="text-sm text-gray-500">当前登录用户</p>
                            <p className="font-bold text-lg text-apple-text dark:text-apple-dark-text">{user.name}</p>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <CheckCircle size={12} className="mr-1" /> 已自动关联头像和昵称
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">昵称 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none transition-all"
                                    placeholder="请输入您的昵称"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">头像 (可选)</label>
                                <button type="button" onClick={() => setUseCustomAvatarFile(!useCustomAvatarFile)} className="text-xs text-apple-blue hover:underline">
                                    {useCustomAvatarFile ? '切换为 URL' : '切换为上传'}
                                </button>
                            </div>
                            
                            {useCustomAvatarFile ? (
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                        {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 m-3 text-gray-400" />}
                                    </div>
                                    <div className="relative flex-1">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleAvatarFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="w-full py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:border-apple-blue transition-colors cursor-pointer text-center">
                                            {avatarFile ? '已选择图片' : '点击上传头像'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none transition-all"
                                        placeholder="https://..."
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">打赏截图 <span className="text-red-500">*</span></label>
                    <div className="relative group">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`
                            border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors h-48
                            ${screenshot ? 'border-apple-blue bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-apple-blue hover:bg-gray-50 dark:hover:bg-gray-800'}
                        `}>
                            {screenshot ? (
                                <div className="relative h-full w-full flex items-center justify-center">
                                    <img src={screenshot} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain shadow-sm" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <p className="text-white text-sm font-bold">点击更换</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-400 group-hover:text-apple-blue group-hover:scale-110 transition-all">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">点击上传截图</p>
                                    <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? '提交中...' : '提交记录'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const About = () => {
    const [showDonationModal, setShowDonationModal] = useState(false);

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 text-center mb-16">
            <DonationFormModal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />

            <div className="animate-in slide-in-from-bottom-4 duration-700">
                <Avatar src="https://picsum.photos/id/1005/200/200" alt="Me" size="xl" className="mx-auto" />
                <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-2 text-apple-text dark:text-apple-dark-text">John Developer</h1>
                <p className="text-lg md:text-xl text-apple-subtext dark:text-apple-dark-subtext mb-8">用像素和爱构建数字体验。</p>
                
                <div className="flex justify-center space-x-4 mb-12">
                    <Button>下载简历</Button>
                    <Button variant="secondary">联系我</Button>
                </div>
            </div>

            <div className="text-left bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            
            <section>
                <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">哲学</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    我相信优秀的软件不仅仅是关于代码，更是关于它给用户带来的感受。
                    坚持极简、清晰和深度的原则，我致力于创造直观且令人愉悦的界面。
                </p>
            </section>
            
            <section>
                <h3 className="text-lg font-bold mb-4 text-apple-text dark:text-apple-dark-text">技术栈</h3>
                <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Tailwind', 'Node.js', 'Next.js', 'Figma', 'GraphQL'].map(skill => (
                        <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>

            <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-apple-text dark:text-apple-dark-text flex items-center">
                            <Gift size={20} className="mr-2 text-pink-500" /> 打赏名单
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {DONORS.map(donor => (
                            <div key={donor.id} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors border border-transparent hover:border-pink-100 dark:hover:border-pink-800/30">
                                <Avatar src={donor.avatar} alt={donor.name} size="sm" />
                                <div className="text-left min-w-0">
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{donor.name}</div>
                                    <div className="text-xs text-pink-500 font-bold flex items-center">
                                        <Coffee size={10} className="mr-1"/> {donor.amount}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
                        <p className="text-sm text-gray-500 mb-4">如果您喜欢我的作品，欢迎打赏支持！您的支持是我持续创作的动力。</p>
                        <Button 
                            className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30" 
                            onClick={() => setShowDonationModal(true)}
                        >
                            <Upload size={16} className="mr-2" /> 上传打赏记录
                        </Button>
                    </div>
            </section>
            </div>
        </div>
    );
};