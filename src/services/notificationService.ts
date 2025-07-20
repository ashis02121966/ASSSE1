import { supabase } from '../lib/supabase';
import { Notification } from '../types';

export class NotificationService {
  // Get notifications for a user
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as Notification['type'],
      timestamp: notification.created_at,
      read: notification.is_read,
      userId: notification.user_id
    }));
  }

  // Create new notification
  static async createNotification(notificationData: {
    userId: string;
    title: string;
    message: string;
    type?: Notification['type'];
  }): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type as Notification['type'],
      timestamp: data.created_at,
      read: data.is_read,
      userId: data.user_id
    };
  }

  // Mark notification as read
  static async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  // Delete notification
  static async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}