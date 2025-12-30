import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Create a new notification
   */
  async create(data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  /**
   * Get all notifications for a user
   */
  async findAllForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) return null;

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  /**
   * Delete a notification
   */
  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.notificationRepository.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  // =========================================================================
  // HELPER METHODS FOR CREATING SPECIFIC NOTIFICATIONS
  // =========================================================================

  /**
   * Notify user that their reservation was accepted
   */
  async notifyReservationAccepted(
    userId: number,
    deliveryId: number,
    carrierName: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'RESERVATION_ACCEPTED',
      title: 'Réservation acceptée ✅',
      message: `Votre demande de transport a été acceptée par ${carrierName}. Vous pouvez maintenant suivre votre livraison.`,
      relatedId: deliveryId,
      relatedType: 'delivery',
    });
  }

  /**
   * Notify user that their reservation was rejected
   */
  async notifyReservationRejected(
    userId: number,
    deliveryId: number,
    carrierName: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      type: 'RESERVATION_REJECTED',
      title: 'Réservation refusée ❌',
      message: `Votre demande de transport a été refusée par ${carrierName}. Veuillez choisir un autre transporteur.`,
      relatedId: deliveryId,
      relatedType: 'delivery',
    });
  }

  /**
   * Notify carrier owner of a new reservation request
   */
  async notifyNewReservation(
    carrierOwnerId: number,
    deliveryId: number,
    clientName: string,
    goodsType: string,
  ): Promise<Notification> {
    return this.create({
      userId: carrierOwnerId,
      type: 'NEW_RESERVATION',
      title: 'Nouvelle demande de réservation 📦',
      message: `${clientName} souhaite réserver votre transport pour: ${goodsType}. Veuillez accepter ou refuser la demande.`,
      relatedId: deliveryId,
      relatedType: 'delivery',
    });
  }

  /**
   * Notify user of delivery status change
   */
  async notifyDeliveryStatus(
    userId: number,
    deliveryId: number,
    status: string,
  ): Promise<Notification> {
    const statusMessages: Record<string, string> = {
      IN_TRANSIT: 'Votre livraison est en cours de transport.',
      DELIVERED: 'Votre livraison a été effectuée avec succès!',
      CANCELED: 'Votre livraison a été annulée.',
    };

    return this.create({
      userId,
      type: 'DELIVERY_STATUS',
      title: `Statut de livraison: ${status}`,
      message: statusMessages[status] || `Le statut de votre livraison a été mis à jour: ${status}`,
      relatedId: deliveryId,
      relatedType: 'delivery',
    });
  }
}
