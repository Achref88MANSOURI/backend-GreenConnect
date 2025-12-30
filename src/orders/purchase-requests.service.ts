import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRequest, PurchaseRequestStatus } from './entities/purchase-request.entity';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { RespondPurchaseRequestDto } from './dto/respond-purchase-request.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepo: Repository<PurchaseRequest>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new purchase request
   */
  async create(buyerId: number, dto: CreatePurchaseRequestDto): Promise<PurchaseRequest> {
    // Get the product with farmer relation
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
      relations: ['farmer'],
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    // Check that buyer is not the seller
    if (product.farmer.id === buyerId) {
      throw new BadRequestException('Vous ne pouvez pas acheter votre propre produit');
    }

    // Calculate total price
    const totalPrice = Number(product.price) * dto.quantity;

    // Create the purchase request
    const purchaseRequest = this.purchaseRequestRepo.create({
      buyerId,
      productId: dto.productId,
      sellerId: product.farmer.id,
      quantity: dto.quantity,
      totalPrice,
      buyerName: dto.buyerName,
      buyerPhone: dto.buyerPhone,
      buyerAddress: dto.buyerAddress,
      buyerMessage: dto.buyerMessage,
      status: PurchaseRequestStatus.PENDING,
    });

    const saved = await this.purchaseRequestRepo.save(purchaseRequest);

    // Notify the seller
    await this.notificationsService.create({
      userId: product.farmer.id,
      type: 'NEW_PURCHASE_REQUEST',
      title: 'Nouvelle demande d\'achat 🛒',
      message: `${dto.buyerName} souhaite acheter ${dto.quantity} unité(s) de "${product.title}". Consultez la demande pour accepter ou refuser.`,
      relatedId: saved.id,
      relatedType: 'purchase_request',
    });

    return this.findOne(saved.id);
  }

  /**
   * Find all purchase requests made by a buyer
   */
  async findByBuyer(buyerId: number): Promise<PurchaseRequest[]> {
    return this.purchaseRequestRepo.find({
      where: { buyerId },
      relations: ['product', 'product.farmer', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all purchase requests for a seller's products
   */
  async findBySeller(sellerId: number): Promise<PurchaseRequest[]> {
    return this.purchaseRequestRepo.find({
      where: { sellerId },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a single purchase request by ID
   */
  async findOne(id: number): Promise<PurchaseRequest> {
    const request = await this.purchaseRequestRepo.findOne({
      where: { id },
      relations: ['product', 'product.farmer', 'buyer', 'seller'],
    });

    if (!request) {
      throw new NotFoundException('Demande d\'achat introuvable');
    }

    return request;
  }

  /**
   * Update a purchase request (only by buyer, only if pending)
   */
  async update(
    id: number,
    buyerId: number,
    dto: UpdatePurchaseRequestDto,
  ): Promise<PurchaseRequest> {
    const request = await this.findOne(id);

    if (request.buyerId !== buyerId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres demandes');
    }

    if (request.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException('Impossible de modifier une demande déjà traitée');
    }

    // Update fields
    if (dto.quantity !== undefined) {
      request.quantity = dto.quantity;
      // Recalculate total price
      const product = await this.productRepo.findOne({ where: { id: request.productId } });
      if (product) {
        request.totalPrice = Number(product.price) * dto.quantity;
      }
    }
    if (dto.buyerName !== undefined) request.buyerName = dto.buyerName;
    if (dto.buyerPhone !== undefined) request.buyerPhone = dto.buyerPhone;
    if (dto.buyerAddress !== undefined) request.buyerAddress = dto.buyerAddress;
    if (dto.buyerMessage !== undefined) request.buyerMessage = dto.buyerMessage;

    return this.purchaseRequestRepo.save(request);
  }

  /**
   * Cancel/Delete a purchase request (only by buyer, only if pending)
   */
  async cancel(id: number, buyerId: number): Promise<void> {
    const request = await this.findOne(id);

    if (request.buyerId !== buyerId) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres demandes');
    }

    if (request.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException('Impossible d\'annuler une demande déjà traitée');
    }

    await this.purchaseRequestRepo.delete(id);
  }

  /**
   * Accept a purchase request (only by seller)
   */
  async accept(
    id: number,
    sellerId: number,
    dto?: RespondPurchaseRequestDto,
  ): Promise<PurchaseRequest> {
    const request = await this.findOne(id);

    if (request.sellerId !== sellerId) {
      throw new ForbiddenException('Vous ne pouvez accepter que les demandes pour vos produits');
    }

    if (request.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Get seller's phone number
    const seller = await this.userRepo.findOne({ where: { id: sellerId } });
    const sellerPhone = seller?.phoneNumber || request.product?.phoneNumber || '';

    request.status = PurchaseRequestStatus.ACCEPTED;
    request.sellerPhone = sellerPhone;
    if (dto?.sellerResponse) {
      request.sellerResponse = dto.sellerResponse;
    }

    const saved = await this.purchaseRequestRepo.save(request);

    // Notify the buyer
    await this.notificationsService.create({
      userId: request.buyerId,
      type: 'PURCHASE_REQUEST_ACCEPTED',
      title: 'Demande d\'achat acceptée ✅',
      message: `Votre demande d\'achat pour "${request.product.title}" a été acceptée! Contactez le vendeur au ${sellerPhone}.`,
      relatedId: saved.id,
      relatedType: 'purchase_request',
    });

    return this.findOne(saved.id);
  }

  /**
   * Reject a purchase request (only by seller)
   */
  async reject(
    id: number,
    sellerId: number,
    dto?: RespondPurchaseRequestDto,
  ): Promise<PurchaseRequest> {
    const request = await this.findOne(id);

    if (request.sellerId !== sellerId) {
      throw new ForbiddenException('Vous ne pouvez refuser que les demandes pour vos produits');
    }

    if (request.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    request.status = PurchaseRequestStatus.REJECTED;
    if (dto?.sellerResponse) {
      request.sellerResponse = dto.sellerResponse;
    }

    const saved = await this.purchaseRequestRepo.save(request);

    // Notify the buyer
    await this.notificationsService.create({
      userId: request.buyerId,
      type: 'PURCHASE_REQUEST_REJECTED',
      title: 'Demande d\'achat refusée ❌',
      message: `Votre demande d\'achat pour "${request.product.title}" a été refusée.${dto?.sellerResponse ? ` Motif: ${dto.sellerResponse}` : ''}`,
      relatedId: saved.id,
      relatedType: 'purchase_request',
    });

    return this.findOne(saved.id);
  }
}
