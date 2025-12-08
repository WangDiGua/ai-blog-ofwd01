import { request } from '../client';
import { Song } from '../../types';

export const musicApi = {
    getList: () => 
        request.get<Song[]>('/music'),
};
