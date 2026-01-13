import apiClientManager from "../api/apiClientManager";
import { getSocketService } from "./socketService";
import type { SocketService } from "./socketService";
// import type { ICreateScrapperRequest, IRequestStatus } from "../types/scrapper";
// import type { IEstimateResponse } from "../types/scrapper";
import { SCRAPPING_MARKETS_ENUM, type IParsedCarItem, type IQueueStatus } from "../constants/scrapper";

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
    async getTaskDataItems(taskId: string): Promise<{items: IParsedCarItem[], total_estimate: number}> {
        const res = await apiClientManager.getClient().get(`/items/task/${taskId}`);
        return res.data || {
            items: [] as IParsedCarItem[],
            total_estimate: 0,
        };
    },
    async refreshScrapperItemDetails(data: IRefreshScrapperItem): Promise<any> {
        const res = await apiClientManager.getClient().post('/start/urls', { ...data });

        return res.data;
    },
    async exportTask(taskId: string): Promise<Blob> {
        const res = await apiClientManager.getClient().get(`/export/task/${taskId}.xlsx`, {
            responseType: 'blob'
        });
        return res.data;
    },
    async getQueueStatus(): Promise<IQueueStatus> {
        const res = await apiClientManager.getClient().get('/queue/status');
        return res.data;
    },
    async cleanQueueStuckedMessage(messageId: string): Promise<any> {
        const res = await apiClientManager.getClient().post('/queue/clean-stucked', { message_id: messageId });
        return res.data;
    },

    // Socket.IO methods
    getSocketService(): SocketService {
        return getSocketService();
    },

    async connectSocket(baseUrl?: string): Promise<boolean> {
        const socketService = getSocketService();
        socketService.updateBaseUrl(baseUrl || '');
        return await socketService.connect(baseUrl);
    },

    disconnectSocket(): void {
        const socketService = getSocketService();
        socketService.disconnect();
    },

    subscribeToQueueStatus(callback: (data: IQueueStatus) => void): () => void {
        const socketService = getSocketService();
        return socketService.subscribeToQueueStatus(callback);
    },

    subscribeToSocketStatus(callback: (status: any) => void): () => void {
        const socketService = getSocketService();
        return socketService.subscribeToStatus(callback);
    },

    isSocketHealthy(): boolean {
        const socketService = getSocketService();
        return socketService.isHealthy();
    },

    getSocketStatus(): any {
        const socketService = getSocketService();
        return socketService.getStatus();
    }
};