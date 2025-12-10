import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Avatar, Card, FeedbackModal, Modal, Spinner, MarkdownEditor, RankBadge } from '../components/ui';
import { userApi, articleApi } from '../services/api';
import { Settings, Award, Edit3, Image as ImageIcon, Crown, LogOut, MessageSquare, Users, Heart, AlertTriangle, Zap, Calendar, CheckCircle, Gem } from 'lucide-react';
import { User, CULTIVATION_LEVELS, CultivationLevel } from '../types';

// --- 用户列表模态框 ---
const UserListModal = ({ isOpen, onClose, title, type }: { isOpen: boolean, onClose: () => void, title: string, type: 'followers' | 'following' }) => {
    const [users, setUsers] = useState<{id: string, name: string, avatar: string, bio: string, isFollowing: boolean, level: CultivationLevel}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const apiCall = type === 'followers' ? userApi.getFollowers : userApi.getFollowing;
            apiCall().then(res => {
                setUsers(res);
                setLoading(false);
            });
        }
    }, [isOpen, type]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="max-h-[60vh] overflow-y-auto">
                {loading ? <div className="flex justify-center p-4"><Spinner /></div> : (
                    <div className="space-y-4">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Avatar src={u.avatar} alt={u.name} size="md" />
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <div className="font-semibold text-sm text-apple-text dark:text-apple-dark-text">{u.name}</div>
                                            <RankBadge level={u.level} />
                                        </div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{u.bio}</div>
                                    </div>
                                </div>
                                <Button size="sm" variant={u.isFollowing ? "secondary" : "primary"} className="text-xs">
                                    {u.isFollowing ? '已关注' : '关注'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

// --- VIP 升级模态框 ---
const VipUpgradeModal = ({ isOpen, onClose, onUpgrade }: { isOpen: boolean, onClose: () => void, onUpgrade: (type: 'monthly' | 'permanent') => void }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="开通会员">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
                        <Crown className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">尊享 VIP 特权</h3>
                    <p className="text-sm text-gray-500 mt-1">解锁专属标识、AI 次数翻倍及更多功能</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 月卡 */}
                    <div className="border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-4 hover:border-yellow-400 transition-colors cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-gray-200 text-xs px-2 py-0.5 rounded-bl-lg text-gray-600">体验</div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">月度会员</h4>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-2xl font-bold text-yellow-600">¥1.00</span>
                            <span className="text-sm text-gray-400 ml-1">/ 月</span>
                        </div>
                        <Button className="w-full mt-4 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" onClick={() => onUpgrade('monthly')}>立即开通</Button>
                    </div>

                    {/* 永久卡 */}
                    <div className="border-2 border-yellow-400 rounded-2xl p-4 bg-yellow-50/50 dark:bg-yellow-900/10 cursor-pointer relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-xs px-2 py-0.5 rounded-bl-lg text-white font-bold">超值推荐</div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                            永久会员 <Gem size={14} className="ml-1 text-purple-500"/>
                        </h4>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600">¥9.90</span>
                            <span className="text-sm text-gray-400 ml-1">/ 永久</span>
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30 border-none" onClick={() => onUpgrade('permanent')}>立即开通</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- 境界突破答题模态框 ---
const CultivationQuizModal = ({ isOpen, onClose, onPass }: { isOpen: boolean, onClose: () => void, onPass: () => void }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const questions = [
        { q: "React 中用于管理状态的 Hook 是？", options: ["useEffect", "useState", "useRef", "useMemo"], ans: 1 },
        { q: "CSS 中 'flex' 布局的主轴对齐属性是？", options: ["align-items", "justify-content", "flex-direction", "align-content"], ans: 1 },
        { q: "JavaScript 中 'const' 声明的变量可以重新赋值吗？", options: ["可以", "不可以", "看情况", "仅在函数内可以"], ans: 1 },
        { q: "HTML5 中用于播放视频的标签是？", options: ["<audio>", "<media>", "<video>", "<movie>"], ans: 2 },
        { q: "HTTP 协议中表示成功的状态码是？", options: ["404", "500", "200", "301"], ans: 2 },
        { q: "Git 中提交暂存区更改的命令是？", options: ["git push", "git add", "git commit", "git checkout"], ans: 2 },
        { q: "TypeScript 是 JavaScript 的什么集？", options: ["子集", "超集", "补集", "并集"], ans: 1 },
        { q: "React组件生命周期中，挂载完成后执行的方法是？", options: ["componentDidMount", "componentWillUnmount", "render", "constructor"], ans: 0 },
        { q: "下列哪个不是 JS 的基本数据类型？", options: ["Number", "String", "Array", "Boolean"], ans: 2 },
        { q: "Tailwind CSS 中 'text-center' 的作用是？", options: ["文本左对齐", "文本右对齐", "文本居中", "文本两端对齐"], ans: 2 },
    ];

    const handleAnswer = (idx: number) => {
        if (idx === questions[currentQ].ans) {
            setScore(s => s + 1);
        }
        if (currentQ < questions.length - 1) {
            setCurrentQ(q => q + 1);
        } else {
            setFinished(true);
        }
    };

    const reset = () => {
        setCurrentQ(0);
        setScore(0);
        setFinished(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="筑基试炼">
            {!finished ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>当前进度</span>
                        <span>{currentQ + 1} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{width: `${((currentQ) / questions.length) * 100}%`}}></div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{questions[currentQ].q}</h3>
                    
                    <div className="space-y-3">
                        {questions[currentQ].options.map((opt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all text-sm font-medium"
                            >
                                {String.fromCharCode(65 + idx)}. {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    {score === questions.length ? (
                        <div className="space-y-4">
                            <div className="text-5xl">🎉</div>
                            <h3 className="text-2xl font-bold text-green-600">试炼通过！</h3>
                            <p className="text-gray-500">恭喜道友，根基已成，即刻筑基！</p>
                            <Button onClick={onPass} className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                                突破境界
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-5xl">🥀</div>
                            <h3 className="text-2xl font-bold text-gray-600">试炼未过</h3>
                            <p className="text-gray-500">道心不稳，仅答对 {score} 题，需全对方可筑基。</p>
                            <Button onClick={reset} variant="secondary" className="w-full mt-4">
                                重整旗鼓
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

// --- 签到明细模态框 ---
const SignInHistoryModal = ({ isOpen, onClose, history }: { isOpen: boolean, onClose: () => void, history: {date: string, points: number}[] }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="签到记录">
            <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                        <Award size={16} className="mr-2"/> 签到规则
                    </h4>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                        <li>每日签到可获得 10 积分。</li>
                        <li>连续签到 7 天额外奖励 50 积分。</li>
                        <li>积分可用于提升修仙境界（筑基期后）。</li>
                        <li>等级越高，每日签到基础积分越多（每级+5）。</li>
                    </ul>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {history.length > 0 ? (
                        history.map((record, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{record.date}</span>
                                <span className="text-xs font-bold text-green-500">+{record.points} 积分</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-8">暂无签到记录</div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export const Profile = () => {
    const { user: currentUser, updateUser, isLoggedIn, showToast, logout, requireAuth } = useStore();
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate();
    
    // 状态
    const [displayUser, setDisplayUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    
    const [activeTab, setActiveTab] = useState('articles');
    const [isEditing, setIsEditing] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // 登出确认框
    
    // 模态框状态
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showVipModal, setShowVipModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showSignInModal, setShowSignInModal] = useState(false);
    
    // 编辑表单状态
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    // 写作状态
    const [newArticleTitle, setNewArticleTitle] = useState('');
    const [newArticleContent, setNewArticleContent] = useState('');

    // 签到状态
    const [checkedIn, setCheckedIn] = useState(false);

    // 判断是否是当前登录用户的个人主页
    const isMe = !id || (currentUser && id === currentUser.id) || (currentUser && id === 'u-123'); // u-123 is mock ID for current user

    useEffect(() => {
        const fetchProfile = async () => {
            if (isMe) {
                if (!isLoggedIn) {
                    navigate('/'); // 如果没登录且访问的是 /profile，重定向
                    return;
                }
                setDisplayUser(currentUser);
            } else {
                // 访问他人主页
                if (!id) return;
                setLoadingUser(true);
                try {
                    const fetchedUser = await userApi.getProfile(id);
                    setDisplayUser(fetchedUser);
                } catch (e) {
                    showToast('无法加载用户信息', 'error');
                    navigate('/');
                } finally {
                    setLoadingUser(false);
                }
            }
        };
        fetchProfile();
    }, [id, currentUser, isLoggedIn, navigate, isMe]);

    useEffect(() => {
        if (displayUser) {
            setName(displayUser.name);
            setBio(displayUser.bio || '');
            setCoverUrl(displayUser.coverImage || 'https://picsum.photos/seed/cover/1200/400');
        }
    }, [displayUser]);

    const handleUpdate = async () => {
        if (isMe) {
            await updateUser({ name, bio, coverImage: coverUrl });
            setIsEditing(false);
        }
    };

    const handleFollow = async () => {
        requireAuth(async () => {
            if (!displayUser) return;
            // 模拟API调用
            await userApi.follow({ userId: displayUser.id, isFollowing: !displayUser.isFollowing });
            
            // 乐观更新本地显示
            setDisplayUser(prev => prev ? ({
                ...prev,
                isFollowing: !prev.isFollowing,
                followersCount: (prev.followersCount || 0) + (prev.isFollowing ? -1 : 1)
            }) : null);
            
            showToast(displayUser.isFollowing ? '已取消关注' : '已关注', 'success');
        });
    };

    const handleCheckIn = async () => {
        if (checkedIn) {
            showToast('今天已经签到过了！', 'info');
            return;
        }
        try {
            const res = await userApi.checkIn();
            setCheckedIn(true);
            
            const todayStr = new Date().toLocaleDateString();
            const newHistory = [...(currentUser?.signInHistory || []), { date: todayStr, points: res.points }];
            
            updateUser({ points: res.total, signInHistory: newHistory });
            showToast(`签到成功！ +${res.points} 积分`, 'success');
        } catch(e) {
            console.error(e);
        }
    };

    const handleVipUpgrade = (type: 'monthly' | 'permanent') => {
        // 模拟支付成功
        updateUser({ 
            role: 'vip', 
            vipType: type 
        });
        setShowVipModal(false);
        showToast(type === 'monthly' ? '月度会员开通成功！' : '尊贵永久会员开通成功！', 'success');
    };

    const handleLevelUp = () => {
        updateUser({ level: '筑基期' });
        setShowQuizModal(false);
        showToast('恭喜突破瓶颈，晋升筑基期！', 'success');
    };

    const handlePublish = async () => {
        if (!newArticleTitle || !newArticleContent) return;
        try {
            await articleApi.create({ title: newArticleTitle, content: newArticleContent });
            setNewArticleTitle('');
            setNewArticleContent('');
            setActiveTab('articles');
            showToast('文章发布成功', 'success');
        } catch (e) {
            console.error(e);
        }
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
        navigate('/');
    };

    if (loadingUser) return <div className="flex justify-center h-[60vh] items-center"><Spinner /></div>;
    if (!displayUser) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <UserListModal isOpen={showFollowers} onClose={() => setShowFollowers(false)} title="粉丝列表" type="followers" />
            <UserListModal isOpen={showFollowing} onClose={() => setShowFollowing(false)} title="关注列表" type="following" />
            <VipUpgradeModal isOpen={showVipModal} onClose={() => setShowVipModal(false)} onUpgrade={handleVipUpgrade} />
            <CultivationQuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} onPass={handleLevelUp} />
            <SignInHistoryModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} history={displayUser.signInHistory || []} />
            
            {/* 登出确认弹窗 */}
            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="确认退出">
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">您确定要退出登录吗？</p>
                    <div className="flex space-x-4 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsLogoutModalOpen(false)}>取消</Button>
                        <Button variant="danger" className="flex-1" onClick={confirmLogout}>确认退出</Button>
                    </div>
                </div>
            </Modal>

            {/* 头部 / 封面区域 */}
            <div className="relative mb-8 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="h-48 md:h-64 relative bg-gray-200 dark:bg-gray-700">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    {isMe && isEditing && (
                        <div className="absolute top-4 right-4 flex space-x-2">
                             <input 
                                className="hidden" 
                                type="file" 
                                id="coverUpload" 
                                onChange={(e) => {
                                    if(e.target.files?.[0]) {
                                        const url = URL.createObjectURL(e.target.files[0]);
                                        setCoverUrl(url);
                                    }
                                }}
                             />
                             <label htmlFor="coverUpload" className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg cursor-pointer backdrop-blur-md flex items-center text-sm">
                                <ImageIcon size={16} className="mr-2"/> 更换封面
                             </label>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end">
                     <div className="relative -mt-16 mb-4 md:mb-0 md:mr-6 group">
                         <div className="p-1 bg-white dark:bg-gray-800 rounded-full relative">
                            <Avatar src={displayUser.avatar} alt={displayUser.name} size="xl" />
                            {(displayUser.role === 'vip' || displayUser.role === 'admin') && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-300 to-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 animate-bounce-slow" title={displayUser.role.toUpperCase()}>
                                    <Crown size={14} fill="currentColor" />
                                </div>
                            )}
                         </div>
                     </div>
                     
                     <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                        {isMe && isEditing ? (
                            <div className="space-y-3 mt-4 max-w-md">
                                <input className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" value={name} onChange={e => setName(e.target.value)} placeholder="Name"/>
                                <textarea className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" rows={2}/>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row items-center md:items-baseline space-x-0 md:space-x-3 space-y-2 md:space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <h1 className="text-3xl font-bold text-apple-text dark:text-apple-dark-text">{displayUser.name}</h1>
                                        {/* 等级展示 */}
                                        <RankBadge level={displayUser.level || '炼气期'} />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {displayUser.role === 'admin' && <span className="text-white text-[10px] px-2 py-0.5 rounded-full bg-red-500 font-bold uppercase">ADMIN</span>}
                                        {displayUser.role === 'vip' && (
                                            <span className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center ${displayUser.vipType === 'permanent' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                                                {displayUser.vipType === 'permanent' ? '永久 VIP' : '月度 VIP'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-3 mt-2">{displayUser.bio || "暂无简介。"}</p>
                                
                                {/* 统计数据行 */}
                                <div className="flex justify-center md:justify-start space-x-6 text-sm">
                                    <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" title="获赞数">
                                        <span className="font-bold text-apple-text dark:text-apple-dark-text block">{displayUser.totalLikes || 0}</span>
                                        <span className="text-gray-400 text-xs">获赞</span>
                                    </div>
                                    <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setShowFollowing(true)}>
                                        <span className="font-bold text-apple-text dark:text-apple-dark-text block">{displayUser.followingCount || 0}</span>
                                        <span className="text-gray-400 text-xs">关注</span>
                                    </div>
                                    <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setShowFollowers(true)}>
                                        <span className="font-bold text-apple-text dark:text-apple-dark-text block">{displayUser.followersCount || 0}</span>
                                        <span className="text-gray-400 text-xs">粉丝</span>
                                    </div>
                                    {/* 积分展示 */}
                                    <div className="text-center md:text-left" title="积分">
                                        <span className="font-bold text-apple-blue block">{displayUser.points || 0}</span>
                                        <span className="text-gray-400 text-xs">灵石(积分)</span>
                                    </div>
                                </div>
                            </>
                        )}
                     </div>

                     <div className="flex flex-col space-y-2 items-center md:items-end mt-4 md:mt-0">
                        {isMe ? (
                            // 当前用户的操作按钮
                            <>
                                <div className="flex space-x-2">
                                    <Button 
                                        className={`flex items-center ${checkedIn ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`} 
                                        onClick={handleCheckIn}
                                        disabled={checkedIn}
                                        size="sm"
                                    >
                                        <CheckCircle size={14} className="mr-1"/>
                                        {checkedIn ? '已签到' : '签到'}
                                    </Button>
                                    
                                    <Button size="sm" variant="secondary" onClick={() => setShowSignInModal(true)}>
                                        <Calendar size={14} className="mr-1"/> 明细
                                    </Button>

                                    {/* VIP 开通入口 */}
                                    {displayUser.vipType !== 'permanent' && (
                                        <Button 
                                            size="sm" 
                                            variant="vip"
                                            onClick={() => setShowVipModal(true)}
                                            className="animate-pulse"
                                        >
                                            <Crown size={14} className="mr-1"/> {displayUser.role === 'vip' ? '续费会员' : '开通会员'}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex space-x-2 mt-2">
                                    {/* 境界突破入口 */}
                                    {displayUser.level === '炼气期' && (
                                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowQuizModal(true)}>
                                            <Zap size={14} className="mr-1"/> 突破境界
                                        </Button>
                                    )}

                                    {isEditing ? (
                                        <>
                                            <Button size="sm" onClick={handleUpdate}>保存</Button>
                                            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>取消</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                                            <Edit3 size={16} />
                                        </Button>
                                    )}
                                    
                                    <Button size="sm" variant="secondary" onClick={() => setIsFeedbackOpen(true)}>
                                        <MessageSquare size={16} />
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => setIsLogoutModalOpen(true)}>
                                        <LogOut size={16} />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            // 查看其他用户时的操作按钮
                            <div className="flex space-x-2">
                                <Button onClick={handleFollow} variant={displayUser.isFollowing ? "secondary" : "primary"}>
                                    {displayUser.isFollowing ? '已关注' : '关注'}
                                </Button>
                                <Button variant="secondary">私信</Button>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* 标签页 */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit mx-auto md:mx-0 overflow-x-auto">
                {['articles', 'favorites', 'likes', ...(isMe ? ['write'] : [])].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-apple-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {tab === 'write' ? '写文章' : tab === 'articles' ? '文章' : tab === 'favorites' ? '收藏' : '点赞'}
                    </button>
                ))}
            </div>

            {/* 内容区域 */}
            <div className="min-h-[400px]">
                {activeTab === 'write' ? (
                    <Card className="p-8">
                        <div className="mb-6">
                            <input 
                                className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-300 text-apple-text dark:text-apple-dark-text" 
                                placeholder="文章标题..." 
                                value={newArticleTitle}
                                onChange={e => setNewArticleTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            {/* 使用 Markdown 编辑器替代 Textarea */}
                            <MarkdownEditor
                                value={newArticleContent}
                                onChange={setNewArticleContent}
                                placeholder="讲述你的故事... (支持 Markdown)"
                                height="400px"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handlePublish}>发布</Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {/* 其他标签的模拟列表 */}
                        <div className="text-gray-500 text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            {displayUser.name} 还没有 {activeTab === 'articles' ? '文章' : activeTab === 'favorites' ? '收藏' : '点赞'} (模拟数据)...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};