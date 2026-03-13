import apiClientManager from "../api/apiClientManager";
import { getSocketService } from "./socketService";
import type { SocketService } from "./socketService";
// import type { ICreateScrapperRequest, IRequestStatus } from "../types/scrapper";
// import type { IEstimateResponse } from "../types/scrapper";
import {
    SCRAPPING_MARKETS_ENUM,
    type IParsedCarItem,
    type IQueueStatus,
    type ITaskProgress,
    type IQueueSimpleStatus,
    type IWebsocketConnectionsStatus,
    type IQueueJobsResponse,
    type QueueJobStatus,
} from "../constants/scrapper";
export interface IRefreshScrapperItem {
    taskId: string;
    userId?: string;
    urls: string[];
    market?: SCRAPPING_MARKETS_ENUM | null;
}

interface ITaskResponse {
    taskId: string;
    userId: string;
    market: string;
    status: string;
    itemsCount: number;
    itemsWithoutPhone: number;
    params: {
        yearFrom: number;
        yearTo: number;
        priceFrom: number;
        priceTo: number;
        mileageFrom: number;
        mileageTo: number;
    },
    createdAt: string;
    updatedAt: string;
    completedAt: string;
    durationSec: number;
}

interface IAdminTaskResponse {
    total: number;
    count: number;
    offset: number;
    limit: number;
    filters: {
        userId: string | null;
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

        return res.data.tasks.map((task: Record<string, unknown>) => ({
            ...task,
            id: task.id ?? task.task_id ?? task.taskId,
            taskId: task.task_id ?? task.taskId,
            createdAt: task.created_at ?? task.createdAt,
            itemsCount: task.items_count ?? task.itemsCount,
            durationSec: task.duration_seconds ?? task.durationSec,
            market: task.market as SCRAPPING_MARKETS_ENUM
        })) || [];
    },
    async getTaskDetails(taskId: string): Promise<any> {
        const res = await apiClientManager.getClient().get(`/progress/${taskId}`);
        return res.data;
    },
    async getTaskDataItems(taskId: string): Promise<{items: IParsedCarItem[], total: number}> {
        const res = await apiClientManager.getClient().get(`/items/task/${taskId}`);
        return res.data || {
            items: [] as IParsedCarItem[],
            total: 0,
        };
    },
    async refreshScrapperItemDetails(data: IRefreshScrapperItem): Promise<any> {
        const { taskId, ...rest } = data;
        const res = await apiClientManager.getClient().post('/tasks/' + taskId + '/reparse', { ...rest });

        return res.data;
    },
    async exportTask(taskId: string): Promise<Blob> {
        const res = await apiClientManager.getClient().get(`/export/task/${taskId}.xlsx`, {
            responseType: 'blob'
        });
        return res.data;
    },
    // Detailed queue status used via WebSocket and fallback HTTP
    async getQueueStatus(): Promise<IQueueStatus> {
        const res = await apiClientManager.getClient().get('/queue/status');
        return res.data;
    },
    // Simple BullMQ counters (waiting/active/completed/failed/delayed/paused)
    async getQueueSimpleStatus(): Promise<IQueueSimpleStatus> {
        const res = await apiClientManager.getClient().get('/queue/status');
        return res.data;
    },
    // WebSocket connections overview
    async getWebsocketStatus(): Promise<IWebsocketConnectionsStatus> {
        const res = await apiClientManager.getClient().get('/websocket/status');
        return res.data;
    },
    // Detailed jobs list for a specific status
    async getQueueJobs(params?: { status?: QueueJobStatus; limit?: number }): Promise<IQueueJobsResponse> {
        const res = await apiClientManager.getClient().get('/queue/jobs', {
            params,
        });
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
            params.userId = userId;
        }
        const res = await apiClientManager.getClient().post(`/admin/tasks/${taskId}/restart`, params);
        return res.data;
    },

    async resumeScrappingTask(taskId: string, userId?: string): Promise<ITaskProgress> {
        const params: any = {};
        if (userId) {
            params.userId = userId;
        }
        const res = await apiClientManager.getClient().post(`/tasks/${taskId}/resume`, params);
        return res.data;
    },

    async pauseQueue(): Promise<{ message: string; paused: boolean }> {
        const res = await apiClientManager.getClient().post('/queue/pause');
        return res.data;
    },

    async resumeQueue(): Promise<{ message: string; paused: boolean }> {
        const res = await apiClientManager.getClient().post('/queue/resume');
        return res.data;
    },

    async cleanQueue(params?: { status?: string; grace?: number; limit?: number }): Promise<any> {
        const res = await apiClientManager.getClient().post('/queue/clean', params ?? {});
        return res.data;
    },

    async deleteQueueJob(jobId: string): Promise<void> {
        await apiClientManager.getClient().delete(`/queue/jobs/${jobId}`);
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