import { request } from '../client';
import { CommunityPost, Album } from '../../types';

export const communityApi = {
    getPosts: () => 
        request.get<CommunityPost[]>('/community'),
    
    getDanmaku: () =>
        request.get<string[]>('/danmaku'),

    getAlbums: () =>
        request.get<Album[]>('/albums'),
};