import { supabase } from '../lib/supabase';

export class NotificationService {
  /**
   * Fetches all notification IDs marked as read by the specified user from Supabase
   */
  public static async fetchUserReadIds(userId: string): Promise<Set<string>> {
    if (!userId) return new Set();

    try {
      const { data, error } = await supabase
        .from('NotificationRead')
        .select('notificationId')
        .eq('userId', userId);

      if (error) {
        // Table might not exist yet or connection issue
        console.warn('[NotificationService] fetchUserReadIds warning:', error.message);
        return new Set();
      }

      if (data && Array.isArray(data)) {
        return new Set(data.map((r: { notificationId: string }) => r.notificationId));
      }
    } catch (err) {
      console.warn('[NotificationService] fetchUserReadIds exception:', err);
    }

    return new Set();
  }

  /**
   * Persists a single notification as read for the user in Supabase
   */
  public static async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!userId || !notificationId) return;

    try {
      const { error } = await supabase
        .from('NotificationRead')
        .upsert(
          {
            id: `${userId}_${notificationId}`,
            userId,
            notificationId,
            readAt: new Date().toISOString(),
          },
          { onConflict: 'userId,notificationId' }
        );

      if (error) {
        console.warn('[NotificationService] markAsRead warning:', error.message);
      }
    } catch (err) {
      console.warn('[NotificationService] markAsRead exception:', err);
    }
  }

  /**
   * Unmarks a notification as read (toggles back to unread) in Supabase
   */
  public static async markAsUnread(userId: string, notificationId: string): Promise<void> {
    if (!userId || !notificationId) return;

    try {
      const { error } = await supabase
        .from('NotificationRead')
        .delete()
        .eq('userId', userId)
        .eq('notificationId', notificationId);

      if (error) {
        console.warn('[NotificationService] markAsUnread warning:', error.message);
      }
    } catch (err) {
      console.warn('[NotificationService] markAsUnread exception:', err);
    }
  }

  /**
   * Bulk persists all specified notifications as read for the user in Supabase
   */
  public static async markAllAsRead(userId: string, notificationIds: string[]): Promise<void> {
    if (!userId || !notificationIds.length) return;

    try {
      const rows = notificationIds.map(notificationId => ({
        id: `${userId}_${notificationId}`,
        userId,
        notificationId,
        readAt: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('NotificationRead')
        .upsert(rows, { onConflict: 'userId,notificationId' });

      if (error) {
        console.warn('[NotificationService] markAllAsRead warning:', error.message);
      }
    } catch (err) {
      console.warn('[NotificationService] markAllAsRead exception:', err);
    }
  }
}
