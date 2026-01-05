import apiClientManager from "../api/apiClientManager";
// import type { ICreateScrapperRequest, IRequestStatus } from "../types/scrapper";
// import type { IEstimateResponse } from "../types/scrapper";
import { SCRAPPING_MARKETS_ENUM } from "../constants/scrapper";

interface IRefreshScrapperItem {
    user_id?: string,
    urls: string[],
    market?: SCRAPPING_MARKETS_ENUM | null
};

export const scrapperServices = {
    async createScrapperRequest(data: any): Promise<any> {
        const res = await apiClientManager.getClient().post('/start', data);
        return res.data;
    },
    async getRequestEstimate(data: any): Promise<any> {
        const res = await apiClientManager.getClient().post('/estimate', data);
        return res.data;
    },
    async getMyRequests(userId: string): Promise<any[]> {
        const res = await apiClientManager.getClient().get('/tasks/user/'+userId+'?limit=10&offset=0', {
            params: { user: userId }
        });

        return res.data.tasks || [];
    },
    async getTaskDetails(taskId: string): Promise<any> {
        const res = await apiClientManager.getClient().get(`/progress/${taskId}`);
        return res.data;
    },
    async getTaskDataItems(taskId: string): Promise<any[]> {
        const res = await apiClientManager.getClient().get(`/items/task/${taskId}`);
        return res.data.items || [];
    },
    async refreshScrapperItemDetails(data: IRefreshScrapperItem): Promise<any> {
        console.log('Refreshing scrapper item details with data:', data);
        const res = await apiClientManager.getClient().post('/start/urls', { ...data });
        console.log('Refresh scrapper item details response:', res.data);
        return res.data;
    },
    // New method to export task
    async exportTask(taskId: string): Promise<Blob> {
        const res = await apiClientManager.getClient().get(`/export/task/${taskId}.xlsx`, {
            responseType: 'blob'
        });
        return res.data;
    },
};