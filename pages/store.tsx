import React, { useEffect, useState, useRef } from 'react';
import { communityApi } from '../services/api';
import { Product, ProductType } from '../types';
import { Card, Spinner, Button, Img, Pagination, Modal, Avatar } from '../components/ui';
import { ShoppingBag, Star, Zap, ShieldCheck, Search, Filter, CircleDollarSign, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/store';

// --- 自定义下拉框组件 (Modern Glassmorphism Style) ---
const CustomSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder = "请选择" 
}: { 
    options: { value: string; label: string }[]; 
    value: string; 
    onChange: (val: string) => void;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className="relative w-full md:w-48 group z-50" ref={containerRef}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-apple-blue transition-colors z-10 pointer-events-none">
                <Filter size={18} />
            </div>
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-white dark:bg-black/20 rounded-full py-3 pl-11 pr-10 text-sm outline-none 
                    border border-transparent transition-all duration-200 text-left flex items-center
                    ${isOpen ? 'ring-2 ring-apple-blue/30 bg-white/90 dark:bg-black/40' : 'hover:bg-white/80 dark:hover:bg-black/30'}
                    text-gray-800 dark:text-gray-100 shadow-sm
                `}
            >
                <span className="truncate font-medium">{selectedLabel}</span>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                </div>
            </button>

            {/* Dropdown Menu (Floating Glass Style) */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 w-full min-w-[12rem] bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-2 z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top overflow-hidden">
                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-all duration-200 group
                                    ${value === opt.value 
                                        ? 'bg-apple-blue text-white shadow-md shadow-blue-500/20' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
                                `}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <Check size={16} className="text-white" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// 商品详情弹窗
const ProductDetailModal = ({ product, isOpen, onClose }: { product: Product | null, isOpen: boolean, onClose: () => void }) => {
    const { user, setAuthModalOpen, showToast, updateUser } = useStore();
    const [buying, setBuying] = useState(false);

    if (!product || !isOpen) return null;

    const handleAction = () => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }

        setBuying(true);
        // 模拟购买过程
        setTimeout(() => {
            if (product.currency === 'points') {
                if ((user.points || 0) < product.price) {
                    showToast('积分不足，无法兑换', 'error');
                } else {
                    showToast('兑换成功！已添加到您的库存', 'success');
                    // 扣除积分 (仅前端模拟更新)
                    updateUser({ points: (user.points || 0) - product.price });
                    onClose();
                }
            } else {
                // 人民币商品，模拟跳转支付或联系客服
                showToast('已创建订单，请联系客服支付', 'success');
                onClose();
            }
            setBuying(false);
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product.type === 'guidance' ? '服务详情' : '商品详情'} className="max-w-2xl">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                    {product.type === 'frame' ? (
                        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
                            <Avatar src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'} alt="Preview" size="xl" className="z-0" />
                            {/* 模拟头像框覆盖 */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]"></div>
                            </div>
                            <div className="absolute bottom-2 text-xs text-gray-400">预览效果</div>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                            <Img src={product.cover} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-apple-text dark:text-apple-dark-text mb-2">{product.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {product.tags?.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{tag}</span>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                        {product.desc}
                    </p>
                    
                    <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">价格</span>
                            <div className="flex items-baseline text-red-500 font-bold text-2xl">
                                {product.currency === 'cny' ? '¥' : <Zap size={20} className="fill-current text-yellow-500 mr-1"/>}
                                <span className={product.currency === 'points' ? 'text-yellow-500' : ''}>{product.price}</span>
                            </div>
                        </div>
                        <Button className={`w-full py-3 ${product.currency === 'points' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`} onClick={handleAction} disabled={buying}>
                            {buying ? '处理中...' : (product.currency === 'points' ? '立即兑换' : '立即购买')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// 商品卡片
const ProductCard = ({ product, onClick }: { product: Product, onClick: () => void }) => {
    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-apple-blue/30 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative z-0"
        >
            <div className={`relative overflow-hidden ${product.type === 'frame' ? 'aspect-square p-6 bg-gray-50 dark:bg-gray-800/50' : 'aspect-video'}`}>
                {product.type === 'frame' ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        {/* Frame Simulation */}
                        <div className="absolute w-28 h-28 rounded-full border-4 border-yellow-400/50 group-hover:border-yellow-400 group-hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all"></div>
                        <img src={product.cover} alt="frame" className="absolute w-28 h-28 opacity-0" /> {/* Hidden real image for now */}
                    </div>
                ) : (
                    <Img src={product.cover} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                
                {product.currency === 'points' && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center shadow-sm">
                        <Zap size={10} className="mr-1 fill-current"/> 积分
                    </div>
                )}
            </div>
            
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-apple-text dark:text-apple-dark-text mb-1 line-clamp-1 group-hover:text-apple-blue transition-colors">
                    {product.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                    {product.desc}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <span className={`font-bold ${product.currency === 'points' ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-600'}`}>
                        {product.currency === 'cny' ? '¥' : ''}{product.price}
                        {product.currency === 'points' && <span className="text-xs font-normal ml-0.5">积分</span>}
                    </span>
                    <span className="text-[10px] text-gray-400">已售 {product.sales}</span>
                </div>
            </div>
        </div>
    );
};

export const Store = () => {
    const { user } = useStore();
    const [activeTab, setActiveTab] = useState<ProductType>('guidance');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Filters for Guidance
    const [filters, setFilters] = useState({
        name: '',
        minPrice: '',
        maxPrice: '',
        category: 'all'
    });

    const fetchProducts = () => {
        setLoading(true);
        communityApi.getProducts({
            type: activeTab,
            page,
            limit: 8,
            name: filters.name,
            minPrice: Number(filters.minPrice) || undefined,
            maxPrice: Number(filters.maxPrice) || undefined,
            category: filters.category
        }).then(res => {
            setProducts(res.items);
            setTotalPages(res.totalPages);
            setLoading(false);
        });
    };

    // Reload when tab or page changes
    useEffect(() => {
        fetchProducts();
    }, [activeTab, page]);

    // Handle filter submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page
        fetchProducts();
    };

    const handleTabChange = (tab: ProductType) => {
        setActiveTab(tab);
        setPage(1);
        setFilters({ name: '', minPrice: '', maxPrice: '', category: 'all' }); // Reset filters
    };

    const hasActiveFilters = filters.name || filters.category !== 'all' || filters.minPrice || filters.maxPrice;

    const clearFilters = () => {
        setFilters({ name: '', minPrice: '', maxPrice: '', category: 'all' });
        setTimeout(fetchProducts, 0); // Trigger refetch
    };

    const categoryOptions = [
        { value: 'all', label: '所有分类' },
        { value: 'Java', label: 'Java' },
        { value: 'Python', label: 'Python' },
        { value: 'Node.js', label: 'Node.js' },
        { value: 'Vue', label: 'Vue' },
        { value: 'React', label: 'React' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mb-20 min-h-screen">
            <ProductDetailModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />

            {/* Header Banner */}
            <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xl p-8 md:p-12 animate-in fade-in slide-in-from-top-4 duration-700 relative z-0">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end">
                    <div className="max-w-2xl">
                        <div className="flex items-center space-x-2 mb-3 text-white/80 font-medium">
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center border border-white/10">
                                <ShoppingBag size={12} className="mr-1.5" /> 官方自营
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">资源与服务商城</h1>
                        <p className="text-white/80 text-lg max-w-lg">
                            从毕业设计指导到个性化主页装扮，一站式满足您的需求。
                        </p>
                    </div>
                    {user && (
                        <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center border border-white/20 shadow-lg group hover:bg-white/20 transition-colors cursor-default">
                            <span className="text-sm mr-3 font-medium">我的积分</span>
                            <Zap size={20} className="text-yellow-400 fill-current mr-2 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-2xl text-yellow-400">{user.points || 0}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs - Floating Island Look (Emoji Removed) */}
            <div className="flex justify-center mb-10 sticky top-20 z-20">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex space-x-1">
                    {[
                        { id: 'guidance', label: '毕设指导' },
                        { id: 'frame', label: '头像框' },
                        { id: 'background', label: '背景图' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as ProductType)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-apple-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modern Floating Filter Bar (Only for Guidance) - Added z-30 to container */}
            {activeTab === 'guidance' && (
                <div className="mb-10 max-w-5xl mx-auto animate-in slide-in-from-top-2 fade-in duration-500 relative z-30">
                    <form 
                        onSubmit={handleFilterSubmit} 
                        className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2rem] p-3 shadow-xl border border-white/20 dark:border-gray-800 flex flex-col md:flex-row gap-3 items-center"
                    >
                        {/* Search */}
                        <div className="relative flex-1 w-full md:w-auto group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-apple-blue transition-colors">
                                <Search size={18} />
                            </div>
                            <input 
                                className="w-full bg-white dark:bg-black/20 rounded-full py-3 pl-11 pr-4 text-sm outline-none border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-apple-blue/10 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                placeholder="搜索服务名称..."
                                value={filters.name}
                                onChange={e => setFilters({...filters, name: e.target.value})}
                            />
                        </div>

                        {/* Custom Category Dropdown */}
                        <CustomSelect 
                            options={categoryOptions}
                            value={filters.category || 'all'}
                            onChange={(val) => setFilters({...filters, category: val})}
                        />

                        {/* Price Range - Combined Pill */}
                        <div className="flex items-center bg-white dark:bg-black/20 rounded-full px-4 py-1.5 border border-transparent focus-within:border-apple-blue/30 focus-within:ring-4 focus-within:ring-apple-blue/10 transition-all w-full md:w-auto">
                            <span className="text-gray-400 text-xs mr-2 font-bold">¥</span>
                            <input 
                                type="number"
                                className="bg-transparent w-16 py-1.5 text-sm outline-none text-center text-gray-800 dark:text-gray-100 placeholder-gray-300"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={e => setFilters({...filters, minPrice: e.target.value})}
                            />
                            <span className="text-gray-300 mx-2">|</span>
                            <input 
                                type="number"
                                className="bg-transparent w-16 py-1.5 text-sm outline-none text-center text-gray-800 dark:text-gray-100 placeholder-gray-300"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {hasActiveFilters && (
                                <button 
                                    type="button"
                                    onClick={clearFilters}
                                    className="p-3 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    title="清除筛选"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <Button type="submit" className="rounded-full px-8 py-3 w-full md:w-auto shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all">
                                筛选
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List - added relative z-0 */}
            {loading ? (
                <div className="flex justify-center h-64 items-center"><Spinner /></div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-0">
                    {products.map((product, idx) => (
                        <div 
                            key={product.id}
                            className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white/50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 backdrop-blur-sm relative z-0">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                        <ShoppingBag size={32} />
                    </div>
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400">没有找到相关商品</p>
                    <p className="text-sm mt-1 opacity-70">尝试调整筛选条件或搜索其他关键词</p>
                    {hasActiveFilters && (
                        <Button variant="secondary" className="mt-6 rounded-full" onClick={clearFilters}>
                            清除所有筛选
                        </Button>
                    )}
                </div>
            )}

            {/* Pagination - Scroll to top added */}
            {!loading && products.length > 0 && (
                <Pagination 
                    page={page} 
                    totalPages={totalPages} 
                    onPageChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                />
            )}
        </div>
    );
};