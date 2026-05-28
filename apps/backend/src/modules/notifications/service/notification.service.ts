import { NotificationRepository } from "../repository/notification.repository.js";
import { NotificationType } from "../types/notification.types.js";
import { AppError } from "@/core/errors/AppError.js";
import { UserModel } from "@/modules/users/schema/user.schema.js";
import { getIO } from "@/config/socket.js";
import { logger } from "@/config/logger.js";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
}

export class NotificationService {
  static async sendNotification(params: CreateNotificationParams) {
    try {
      await NotificationRepository.createNotification(params);
    } catch (error) {
      console.error(
        "[NotificationService] Failed to send notification:",
        error
      );
    }
  }

  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const notifications = await NotificationRepository.getUserNotifications(
      userId,
      page,
      limit
    );
    const unreadCount = await NotificationRepository.getUnreadCount(userId);

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await NotificationRepository.markAsRead(
      notificationId,
      userId
    );
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    return notification;
  }

  static async markAllAsRead(userId: string) {
    await NotificationRepository.markAllAsRead(userId);
  }

  /**
   * Broadcast a claim-status-change notification to all active users and
   * push the event over Socket.io so connected clients update in real time.
   */
  static async broadcastClaimStatusChange(
    claimId: string,
    claimNumber: string | undefined,
    toStatus: string,
    performedByName?: string
  ) {
    try {
      const label = claimNumber ?? claimId;
      const actor = performedByName ? ` by ${performedByName}` : "";
      const title = "Claim Status Updated";
      const message = `Claim ${label} status changed to ${toStatus}${actor}`;

      // 1. Persist notification for every active user
      const users = await UserModel.find(
        { isActive: true },
        { _id: 1 }
      ).lean();

      const docs = users.map((u) => ({
        userId: u._id.toString(),
        type: NotificationType.CLAIM_STATUS,
        title,
        message,
        entityId: claimId,
      }));

      if (docs.length) {
        await Promise.all(
          docs.map((d) => NotificationRepository.createNotification(d))
        );
      }

      // 2. Push real-time event via Socket.io
      const io = getIO();
      io.emit("claim:status-changed", {
        claimId,
        claimNumber: claimNumber ?? null,
        toStatus,
        title,
        message,
        timestamp: new Date().toISOString(),
      });

      logger.info(
        `Broadcasted claim status change: ${label} → ${toStatus} to ${docs.length} users`
      );
    } catch (err) {
      // Notification failures should never block the main flow
      logger.error(err, "Failed to broadcast claim status change notification");
    }
  }
}
