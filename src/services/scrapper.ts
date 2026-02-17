import apiClientManager from "../api/apiClientManager";
import { getSocketService } from "./socketService";
import type { SocketService } from "./socketService";
// import type { ICreateScrapperRequest, IRequestStatus } from "../types/scrapper";
// import type { IEstimateResponse } from "../types/scrapper";
import { SCRAPPING_MARKETS_ENUM, type IParsedCarItem, type IQueueStatus, type ITaskProgress } from "../constants/scrapper";

interface IRefreshScrapperItem {
    taskId: string,
    user_id?: string,
    urls: string[],
    market?: SCRAPPING_MARKETS_ENUM | null
};

interface ITaskResponse {
    task_id: string;
    user_id: string;
    market: string;
    status: string;
    items_count: number;
    itemsWithoutPhone: number;
    params: {
        year_from: number;
        year_to: number;
        price_from: number;
        price_to: number;
        mileage_from: number;
        mileage_to: number;
    },
    created_at: string;
    updated_at: string;
    completed_at: string;
    duration_seconds: number;
}

interface IAdminTaskResponse {
    total: number;
    count: number;
    offset: number;
    limit: number;
    filters: {
        user_id: string | null;
        status: string | null;
    },
    tasks: ITaskResponse[]
}

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

        return res.data.tasks.map((task: any) => ({
            ...task,
            task_id: task.taskId,
            market: task.market as SCRAPPING_MARKETS_ENUM
        })) || [];
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
        console.log('Refreshing scrapper item details:', data);
        const res = await apiClientManager.getClient().post('/tasks/' + data.taskId + '/reparse', { ...data });

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
    async getAllUsersTasks(): Promise<IAdminTaskResponse> {
        const res = await apiClientManager.getClient().get('/admin/tasks', {
            params: {
                limit: 20,
                offset: 0,
                // user_id: '',
                // status: '',
            },
        });
        return res.data;
    },
    async restartScrappingTask(taskId: string, userId?: string): Promise<any> {
        const params: any = {};
        if (userId) {
            params.user_id = userId;
        }
        const res = await apiClientManager.getClient().post(`/admin/tasks/${taskId}/restart`, params);
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
    },

    // Task Progress Socket methods
    async connectToTaskProgress(websocketUrl: string, taskId: string): Promise<boolean> {
        const socketService = getSocketService();
        console.log('🔌 Connecting to task progress:', taskId);
        console.log('   WebSocket URL:', websocketUrl);
        return await socketService.connectToTaskProgress(websocketUrl, taskId);
    },

    disconnectTaskProgress(): void {
        const socketService = getSocketService();
        socketService.disconnectTaskProgress();
    },

    subscribeToTaskProgress(callback: (data: ITaskProgress) => void): () => void {
        const socketService = getSocketService();
        return socketService.subscribeToTaskProgress(callback);
    },

    isTaskProgressSocketHealthy(): boolean {
        const socketService = getSocketService();
        return socketService.isTaskProgressHealthy();
    },

    getTaskProgressSocketStatus(): any {
        const socketService = getSocketService();
        return socketService.getTaskProgressStatus();
    }
};