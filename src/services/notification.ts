import { notifications } from '@mantine/notifications';
import type { NotificationProps } from '@mantine/notifications';

/**
 * Notification types for different scenarios
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'service-status';

/**
 * Color mapping for notification types
 */
const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  'service-status': 'blue',
};

/**
 * Default auto-close settings for different notification types
 */
const DEFAULT_AUTO_CLOSE: Record<NotificationType, number | false> = {
  success: 5000, // 5 seconds
  error: 7000, // 7 seconds
  warning: 6000, // 6 seconds
  info: 5000, // 5 seconds
  'service-status': false, // Don't auto-close service status messages
};

/**
 * Extended notification options
 */
export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  autoClose?: number | false;
  color?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

/**
 * Notification Service
 * 
 * A centralized service for displaying notifications throughout the application.
 * Provides type-safe methods for different notification types with consistent styling
 * and behavior.
 * 
 * @example
 * ```ts
 * import { notificationService } from '@/services/notification';
 * 
 * // Success notification
 * notificationService.success('Operation completed successfully');
 * 
 * // Error notification with custom title
 * notificationService.error('Failed to save', { title: 'Error' });
 * 
 * // Service status (doesn't auto-close)
 * notificationService.serviceStatus('Service is waking up, try after 20 sec');
 * ```
 */
class NotificationService {
  /**
   * Show a notification with custom options
   */
  private show(options: NotificationOptions): string {
    const {
      message,
      type = 'info',
      title,
      autoClose,
      color,
      icon,
      loading = false,
      onClose,
      onOpen,
    } = options;

    const notificationColor = color || NOTIFICATION_COLORS[type];
    const notificationAutoClose = autoClose !== undefined 
      ? autoClose 
      : DEFAULT_AUTO_CLOSE[type];

    const notificationProps: NotificationProps = {
      message,
      color: notificationColor,
      autoClose: notificationAutoClose,
      loading,
      onClose,
      onOpen,
    };

    if (title) {
      notificationProps.title = title;
    }

    if (icon) {
      notificationProps.icon = icon;
    }

    const notificationId = notifications.show(notificationProps);
    // Mantine notifications.show may return void or string depending on version
    // Use unknown for safe type conversion
    return (notificationId as unknown as string) || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show a success notification
   * 
   * @param message - Success message to display
   * @param options - Optional notification options
   * @returns Notification ID
   */
  success(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): string {
    return this.show({
      message,
      type: 'success',
      title: options?.title || 'Success',
      ...options,
    });
  }

  /**
   * Show an error notification
   * 
   * @param message - Error message to display
   * @param options - Optional notification options
   * @returns Notification ID
   */
  error(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): string {
    return this.show({
      message,
      type: 'error',
      title: options?.title || 'Error',
      ...options,
    });
  }

  /**
   * Show a warning notification
   * 
   * @param message - Warning message to display
   * @param options - Optional notification options
   * @returns Notification ID
   */
  warning(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): string {
    return this.show({
      message,
      type: 'warning',
      title: options?.title || 'Warning',
      ...options,
    });
  }

  /**
   * Show an info notification
   * 
   * @param message - Info message to display
   * @param options - Optional notification options
   * @returns Notification ID
   */
  info(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): string {
    return this.show({
      message,
      type: 'info',
      title: options?.title || 'Information',
      ...options,
    });
  }

  /**
   * Show a service status notification
   * Typically used for service wake-up messages or maintenance notifications.
   * These notifications don't auto-close by default.
   * 
   * @param message - Service status message to display
   * @param options - Optional notification options
   * @returns Notification ID
   */
  serviceStatus(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): string {
    return this.show({
      message,
      type: 'service-status',
      title: options?.title || 'Service Status',
      ...options,
    });
  }

  /**
   * Hide a notification by ID
   * 
   * @param id - Notification ID returned from show methods
   */
  hide(id: string): void {
    notifications.hide(id);
  }

  /**
   * Hide all notifications
   */
  hideAll(): void {
    notifications.clean();
  }

  /**
   * Update an existing notification
   * 
   * @param id - Notification ID to update
   * @param options - New notification options
   */
  update(id: string, options: NotificationOptions): void {
    const {
      message,
      type = 'info',
      title,
      autoClose,
      color,
      icon,
      loading = false,
      onClose,
      onOpen,
    } = options;

    const notificationColor = color || NOTIFICATION_COLORS[type];
    const notificationAutoClose = autoClose !== undefined 
      ? autoClose 
      : DEFAULT_AUTO_CLOSE[type];

    const notificationProps: NotificationProps = {
      message,
      color: notificationColor,
      autoClose: notificationAutoClose,
      loading,
      onClose,
      onOpen,
    };

    if (title) {
      notificationProps.title = title;
    }

    if (icon) {
      notificationProps.icon = icon;
    }

    notifications.update({
      id,
      ...notificationProps,
    });
  }
}

/**
 * Singleton instance of NotificationService
 * Export as a constant to ensure single instance across the application
 */
export const notificationService = new NotificationService();

/**
 * Check if service is available based on response or error message
 * 
 * @param data - Axios response, error, or any object with nested data structure
 * @returns Service unavailability message if service is unavailable, null if service is available
 */
export function isServiceAvailable(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  let message: string | undefined;

  // Check for axios error structure: error.response.data.data.message
  const axiosError = data as { response?: { data?: { data?: { message?: string } } } };
  if (axiosError?.response?.data?.data?.message) {
    message = axiosError.response.data.data.message;
  }
  
  // Check for axios response structure: response.data.data.message
  const axiosResponse = data as { data?: { data?: { message?: string } } };
  if (!message && axiosResponse?.data?.data?.message) {
    message = axiosResponse.data.data.message;
  }

  // Check if message indicates service is unavailable
  // Common patterns: "waking up", "try after", "unavailable", "maintenance", "down"
  if (message) {
    const lowerMessage = message.toLowerCase();
    const unavailablePatterns = [
      'waking up',
      'try after',
      'service unavailable',
      'unavailable',
      'maintenance',
      'service down',
      'temporarily unavailable',
      'please wait',
    ];
    
    if (unavailablePatterns.some(pattern => lowerMessage.includes(pattern))) {
      return message; // Service is unavailable, return the message
    }
  }

  return null; // Service appears to be available
}

/**
 * Default export for convenience
 */
export default notificationService;
