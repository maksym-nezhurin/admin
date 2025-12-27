import apiScrapperClient from "../api/apiScrapperClient";
// import type { ICreateScrapperRequest, IRequestStatus } from "../types/scrapper";
// import type { IEstimateResponse } from "../types/scrapper";
import { SCRAPPING_MARKETS_ENUM } from "../constants/scrapper";

interface IRefreshScrapperItem {
    user_id: string,
    urls: string[],
    market: SCRAPPING_MARKETS_ENUM
};

export const scrapperServices = {
    async createScrapperRequest(data: any): Promise<any> {
        const res = await apiScrapperClient.post('/start', data);
        return res.data;
    },
    async getRequestEstimate(data: any): Promise<any> {
        const res = await apiScrapperClient.post('/estimate', data);
        return res.data;
    },
    async getMyRequests(userId: string): Promise<any[]> {
        const res = await apiScrapperClient.get('/tasks/user/'+userId+'?limit=10&offset=0', {
            params: { user: userId }
        });

        return res.data.tasks || [];
    },
    async getTaskDetails(taskId: string): Promise<any> {
        const res = await apiScrapperClient.get(`/progress/${taskId}`);
        return res.data;
    },
    async getTaskDataItems(taskId: string): Promise<any[]> {
        const res = await apiScrapperClient.get(`/items/task/${taskId}`);
        return res.data.items || [];
    },
    async refreshScrapperItemDetails(data: IRefreshScrapperItem): Promise<any> {
        console.log('Refreshing scrapper item details with data:', data);
        const res = await apiScrapperClient.post('/start/urls', { ...data });
        console.log('Refresh scrapper item details response:', res.data);
        return res.data;
    },
};