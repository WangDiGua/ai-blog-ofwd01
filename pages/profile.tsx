import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Avatar, Card, FeedbackModal } from '../components/ui';
import { request } from '../utils/lib';
import { Settings, Award, Edit3, Image as ImageIcon, Crown, LogOut, MessageSquare } from 'lucide-react';

export const Profile = () => {
    const { user, updateUser, isLoggedIn, showToast, logout } = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('articles');
    const [isEditing, setIsEditing] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    
    // Edit Form State
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    // Writer State
    const [newArticleTitle, setNewArticleTitle] = useState('');
    const [newArticleContent, setNewArticleContent] = useState('');

    // Checkin State
    const [checkedIn, setCheckedIn] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
        if (user) {
            setName(user.name);
            setBio(user.bio || '');
            setCoverUrl(user.coverImage || 'https://picsum.photos/seed/cover/1200/400');
        }
    }, [user, isLoggedIn, navigate]);

    const handleUpdate = async () => {
        await updateUser({ name, bio, coverImage: coverUrl });
        setIsEditing(false);
    };

    const handleCheckIn = async () => {
        if (checkedIn) {
            showToast('Already checked in today!', 'info');
            return;
        }
        try {
            const res = await request.post<{points: number, total: number}>('/user/checkin');
            setCheckedIn(true);
            updateUser({ points: res.total });
            showToast(`Checked in! +${res.points} points`, 'success');
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
            showToast('Article published successfully', 'success');
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            
            {/* Header / Cover Area */}
            <div className="relative mb-8 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="h-48 md:h-64 relative bg-gray-200 dark:bg-gray-700">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    {isEditing && (
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
                                <ImageIcon size={16} className="mr-2"/> Change Cover
                             </label>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end">
                     <div className="relative -mt-16 mb-4 md:mb-0 md:mr-6 group">
                         <div className="p-1 bg-white dark:bg-gray-800 rounded-full relative">
                            <Avatar src={user.avatar} alt={user.name} size="xl" />
                            {(user.role === 'vip' || user.role === 'admin') && (
                                <div className="absolute bottom-0 right-0 bg-yellow-400 text-white p-1 rounded-full shadow-md border-2 border-white dark:border-gray-800" title={user.role.toUpperCase()}>
                                    <Crown size={12} fill="currentColor" />
                                </div>
                            )}
                         </div>
                     </div>
                     
                     <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                        {isEditing ? (
                            <div className="space-y-3 mt-4 max-w-md">
                                <input className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" value={name} onChange={e => setName(e.target.value)} placeholder="Name"/>
                                <textarea className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" rows={2}/>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                    <h1 className="text-3xl font-bold text-apple-text dark:text-apple-dark-text">{user.name}</h1>
                                    {user.role !== 'user' && (
                                        <span className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm ${user.role === 'admin' ? 'bg-red-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 max-w-lg">{user.bio || "No bio yet."}</p>
                            </>
                        )}
                     </div>

                     <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <Button 
                            className={`flex items-center ${checkedIn ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`} 
                            onClick={handleCheckIn}
                            disabled={checkedIn}
                        >
                            <Award size={18} className="mr-2"/>
                            {checkedIn ? 'Checked In' : 'Check In'}
                            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">{(user.points || 0) + (checkedIn ? 0 : 0)} pts</span>
                        </Button>
                        
                        {isEditing ? (
                            <>
                                <Button size="sm" onClick={handleUpdate}>Save</Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
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
                     </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit mx-auto md:mx-0 overflow-x-auto">
                {['articles', 'favorites', 'likes', 'write'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-apple-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {tab === 'write' ? 'Write Article' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'write' ? (
                    <Card className="p-8">
                        <div className="mb-6">
                            <input 
                                className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-300 text-apple-text dark:text-apple-dark-text" 
                                placeholder="Article Title..." 
                                value={newArticleTitle}
                                onChange={e => setNewArticleTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <textarea 
                                className="w-full h-96 resize-none border-none outline-none bg-transparent text-lg text-gray-600 dark:text-gray-300 placeholder-gray-300 leading-relaxed" 
                                placeholder="Tell your story... (Markdown supported)" 
                                value={newArticleContent}
                                onChange={e => setNewArticleContent(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handlePublish}>Publish</Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {/* Mock List for other tabs */}
                        <div className="text-gray-500 text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            Showing {activeTab} (Mock Data)...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};