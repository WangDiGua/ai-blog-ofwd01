import { request } from '../client';
import { CommunityPost } from '../../types';

export const communityApi = {
    getPosts: () => 
        request.get<CommunityPost[]>('/community'),
};
