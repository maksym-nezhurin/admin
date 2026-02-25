import { useEffect, useState } from 'react';
import { scrapperServices } from '../services/scrapper';

interface TaskData {
  taskId: string;
  websocketUrl: string;
}

interface ScrapedItem {
  id: number;
  title?: string;
  price?: string;
  sellerName?: string;
  year?: string;
  mileage?: string;
  phone?: string;
  url?: string;
  vin?: string;
  activeAds?: string;
  status: 'active' | 'archived' | 'sold';
  totalAds?: string;
}

interface TaskProgress {
  processed: number;
  total: number;
  percent: number;
}

/**
 * Custom hook for connecting to task-specific WebSocket
 * 
 * @example
 * ```tsx
 * const { items, progress, status } = useTaskWebSocket({
 *   taskId: 'abc-123',
 *   websocketUrl: 'ws://localhost:8001/progress/abc-123/ws'
 * });
 * ```
 */
export function useTaskWebSocket(taskData: TaskData | null) {
  const [items] = useState<ScrapedItem[]>([]);
  const [progress, setProgress] = useState<TaskProgress>({ processed: 0, total: 0, percent: 0 });
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  useEffect(() => {
    if (!taskData?.websocketUrl || !taskData?.taskId) return;

    console.log('🎯 useTaskWebSocket: Connecting to task:', taskData.taskId);

    // Connect to WebSocket
    const connect = async () => {
      try {
        const connected = await scrapperServices.connectToTaskProgress(
          taskData.websocketUrl,
          taskData.taskId
        );

        if (connected) {
          console.log('✅ useTaskWebSocket: Connected successfully');
          setStatus('running');
        } else {
          console.error('❌ useTaskWebSocket: Connection failed');
        }
      } catch (error) {
        console.error('❌ useTaskWebSocket: Error connecting:', error);
      }
    };

    connect();

    // Subscribe to task progress updates
    const unsubscribe = scrapperServices.subscribeToTaskProgress((data) => {
      console.log('📊 useTaskWebSocket: Progress update:', data);

      // Update progress
      setProgress({
        processed: data.processed,
        total: data.total,
        percent: data.percent
      });

      // Update status
      if (data.status === 'finished' || data.status === 'completed') {
        setStatus('completed');
      } else if (data.status === 'running') {
        setStatus('running');
      }
    });

    return () => {
      console.log('🔌 useTaskWebSocket: Cleaning up');
      unsubscribe();
      scrapperServices.disconnectTaskProgress();
    };
  }, [taskData]);

  return { items, progress, status };
}
