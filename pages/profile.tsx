import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Avatar, Card, FeedbackModal, Modal, Spinner } from '../components/ui';
import { request } from '../utils/lib';
import { Settings, Award, Edit3, Image as ImageIcon, Crown, LogOut, MessageSquare, Users, Heart } from 'lucide-react';
import { User } from '../types';

// --- 用户列表模态框 ---
const UserListModal = ({ isOpen, onClose, title, type }: { isOpen: boolean, onClose: () => void, title: string, type: 'followers' | 'following' }) => {
    const [users, setUsers] = useState<{id: string, name: string, avatar: string, bio: string, isFollowing: boolean}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            request.get<any[]>(`/user/${type}`).then(res => {
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
                                        <div className="font-semibold text-sm text-apple-text dark:text-apple-dark-text">{u.name}</div>
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


export const Profile = () => {
    const { user: currentUser, updateUser, isLoggedIn, showToast, logout, requireAuth } = useStore();
    const navigate = useNavigate();
    const { id } = useParams(); // 获取路由参数中的 id
    
    // 状态
    const [displayUser, setDisplayUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    
    const [activeTab, setActiveTab] = useState('articles');
    const [isEditing, setIsEditing] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    
    // 模态框状态
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    
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
                setLoadingUser(true);
                try {
                    const fetchedUser = await request.get<User>(`/users/${id}`);
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
            await request.post('/user/follow', { userId: displayUser.id, isFollowing: !displayUser.isFollowing });
            
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
            const res = await request.post<{points: number, total: number}>('/user/checkin');
            setCheckedIn(true);
            updateUser({ points: res.total });
            showToast(`签到成功！ +${res.points} 积分`, 'success');
        } catch(e) {
            console.error(e);
        }
    };

    const handlePublish = async () => {
        if (!newArticleTitle || !newArticleContent) return;
        try {
            await request.post('/articles/create', { title: newArticleTitle, content: newArticleContent });
            setNewArticleTitle('');
            setNewArticleContent('');
            setActiveTab('articles');
            showToast('文章发布成功', 'success');
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loadingUser) return <div className="flex justify-center h-[60vh] items-center"><Spinner /></div>;
    if (!displayUser) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <UserListModal isOpen={showFollowers} onClose={() => setShowFollowers(false)} title="粉丝列表" type="followers" />
            <UserListModal isOpen={showFollowing} onClose={() => setShowFollowing(false)} title="关注列表" type="following" />
            
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
                                <div className="absolute bottom-0 right-0 bg-yellow-400 text-white p-1 rounded-full shadow-md border-2 border-white dark:border-gray-800" title={displayUser.role.toUpperCase()}>
                                    <Crown size={12} fill="currentColor" />
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
                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                    <h1 className="text-3xl font-bold text-apple-text dark:text-apple-dark-text">{displayUser.name}</h1>
                                    {displayUser.role !== 'user' && (
                                        <span className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm ${displayUser.role === 'admin' ? 'bg-red-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                                            {displayUser.role}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-3">{displayUser.bio || "暂无简介。"}</p>
                                
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
                                </div>
                            </>
                        )}
                     </div>

                     <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        {isMe ? (
                            // 当前用户的操作按钮
                            <>
                                <Button 
                                    className={`flex items-center ${checkedIn ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`} 
                                    onClick={handleCheckIn}
                                    disabled={checkedIn}
                                >
                                    <Award size={18} className="mr-2"/>
                                    {checkedIn ? '已签到' : '签到'}
                                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">{(displayUser.points || 0) + (checkedIn ? 0 : 0)} 分</span>
                                </Button>
                                
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
                                <Button size="sm" variant="danger" onClick={handleLogout}>
                                    <LogOut size={16} />
                                </Button>
                            </>
                        ) : (
                            // 查看其他用户时的操作按钮
                            <>
                                <Button onClick={handleFollow} variant={displayUser.isFollowing ? "secondary" : "primary"}>
                                    {displayUser.isFollowing ? '已关注' : '关注'}
                                </Button>
                                <Button variant="secondary">私信</Button>
                            </>
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
                            <textarea 
                                className="w-full h-96 resize-none border-none outline-none bg-transparent text-lg text-gray-600 dark:text-gray-300 placeholder-gray-300 leading-relaxed" 
                                placeholder="讲述你的故事... (支持 Markdown)" 
                                value={newArticleContent}
                                onChange={e => setNewArticleContent(e.target.value)}
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