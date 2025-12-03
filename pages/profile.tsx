import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { Button, Avatar, Card } from '../components/ui';
import { request } from '../utils/lib';
import { Settings } from 'lucide-react';

export const Profile = () => {
    const { user, updateUser, isLoggedIn } = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('articles');
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');

    // Writer State
    const [newArticleTitle, setNewArticleTitle] = useState('');
    const [newArticleContent, setNewArticleContent] = useState('');

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
            return;
        }
        if (user) {
            setName(user.name);
            setBio(user.bio || '');
        }
    }, [user, isLoggedIn, navigate]);

    const handleUpdate = async () => {
        await updateUser({ name, bio });
        setIsEditing(false);
    };

    const handlePublish = async () => {
        if (!newArticleTitle || !newArticleContent) return;
        try {
            await request.post('/articles/create', { title: newArticleTitle, content: newArticleContent });
            // Reset and show success (handled in store/request mock)
            setNewArticleTitle('');
            setNewArticleContent('');
            setActiveTab('articles');
        } catch (e) {
            console.error(e);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 shadow-sm">
                <div className="relative group">
                    <Avatar src={user.avatar} alt={user.name} size="xl" />
                    <button className="absolute bottom-0 right-0 bg-apple-blue text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings size={14} />
                    </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                        <div className="space-y-3 max-w-md">
                            <input className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700" value={name} onChange={e => setName(e.target.value)} placeholder="Name"/>
                            <textarea className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700" value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" rows={2}/>
                            <div className="flex space-x-2 justify-center md:justify-start">
                                <Button size="sm" onClick={handleUpdate}>Save</Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-apple-text dark:text-apple-dark-text mb-2">{user.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-lg">{user.bio || "No bio yet."}</p>
                            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        </>
                    )}
                </div>
                
                <div className="flex space-x-8 text-center">
                    <div>
                        <div className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">12</div>
                        <div className="text-xs text-gray-500 uppercase">Articles</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-apple-text dark:text-apple-dark-text">1.5k</div>
                        <div className="text-xs text-gray-500 uppercase">Followers</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit mx-auto md:mx-0">
                {['articles', 'favorites', 'likes', 'write'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-apple-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
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
                        <div className="text-gray-500 text-center py-10">
                            Showing {activeTab} (Mock Data)...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};