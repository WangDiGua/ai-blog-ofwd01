import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/store';
import { Spinner } from '../ui/atoms';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

/**
 * 路由守卫组件
 * 自动检测用户登录状态，未登录则跳转首页并弹出登录框
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isLoggedIn, setAuthModalOpen, showToast } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        // 使用 timeout 确保 store 初始化完成 (在真实场景中可能需要 isInitialized 状态)
        const checkAuth = () => {
            if (!isLoggedIn) {
                showToast('请先登录以访问此页面', 'error');
                setAuthModalOpen(true);
                navigate('/');
            }
        };
        
        // 简单的延迟检查，防止在 hydration 过程中误判
        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [isLoggedIn, navigate, setAuthModalOpen, showToast]);

    if (!isLoggedIn) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return <>{children}</>;
};