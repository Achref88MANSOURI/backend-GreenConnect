/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { InvestmentProject, Investment } from '../investments/entities/investment.entity';
import { Delivery } from '../tawssel/entities/delivery.entity';
import { Carrier } from '../tawssel/entities/carrier.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(InvestmentProject)
    private readonly projectRepo: Repository<InvestmentProject>,
    @InjectRepository(Investment)
    private readonly investmentRepo: Repository<Investment>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Carrier)
    private readonly carrierRepo: Repository<Carrier>,
  ) {}

  async getUserOverview(userId: number) {
    const [
      sellerStats,
      buyerStats,
      investorStats,
      equipmentStats,
      carrierStats,
    ] = await Promise.all([
      this.getSellerDashboard(userId),
      this.getBuyerDashboard(userId),
      this.getInvestorDashboard(userId),
      this.getEquipmentOwnerDashboard(userId),
      this.getCarrierDashboard(userId),
    ]);

    return {
      seller: sellerStats,
      buyer: buyerStats,
      investor: investorStats,
      equipmentOwner: equipmentStats,
      carrier: carrierStats,
    };
  }

  async getSellerDashboard(userId: number) {
    // Products stats - Product has farmer relation with farmerId via RelationId
    const allProducts = await this.productRepo.find({
      relations: ['farmer'],
    });
    
    const products = allProducts.filter(p => p.farmerId === userId);

    const totalProducts = products.length;
    // Products don't have stock field, count all as active
    const activeProducts = products.length;
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );

    // Sales stats (orders) - Order has 'total' not 'totalPrice'
    const orders = await this.orderRepo.find({
      relations: ['items', 'items.product', 'items.product.farmer', 'user'],
    });

    // Filter orders that contain products from this farmer
    const userOrders = orders.filter(order =>
      order.items?.some(item => item.product?.farmerId === userId),
    );

    const totalRevenue = userOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    const thisMonthRevenue = userOrders
      .filter(
        order =>
          new Date(order.createdAt).getMonth() === new Date().getMonth(),
      )
      .reduce((sum, order) => sum + Number(order.total), 0);

    return {
      products: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: 0, // Not tracked
        inventoryValue: totalInventoryValue,
      },
      sales: {
        totalOrders: userOrders.length,
        totalRevenue,
        thisMonthRevenue,
        averageOrderValue:
          userOrders.length > 0 ? totalRevenue / userOrders.length : 0,
      },
      recentOrders: userOrders.slice(0, 5),
      topProducts: products
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.title,
          price: p.price,
          stock: 0, // Not tracked
          category: p.location || 'N/A',
        })),
    };
  }

  async getBuyerDashboard(userId: number) {
    const orders = await this.orderRepo.find({
      where: { userId: userId },
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    const thisMonthSpent = orders
      .filter(
        order =>
          new Date(order.createdAt).getMonth() === new Date().getMonth(),
      )
      .reduce((sum, order) => sum + Number(order.total), 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed').length;

    return {
      orders: {
        total: orders.length,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
      spending: {
        total: totalSpent,
        thisMonth: thisMonthSpent,
        averageOrder: orders.length > 0 ? totalSpent / orders.length : 0,
      },
      recentOrders: orders.slice(0, 10).map(o => ({
        id: o.id,
        totalPrice: o.total,
        status: o.status,
        itemCount: o.items?.length || 0,
        createdAt: o.createdAt,
      })),
    };
  }

  async getInvestorDashboard(userId: number) {
    // Investments made by user
    const investments = await this.investmentRepo.find({
      where: { investorId: userId },
      relations: ['project'],
    });

    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0,
    );

    const activeInvestments = investments.filter(
      inv => inv.status === 'ACTIVE',
    ).length;

    const totalReturns = investments.reduce(
      (sum, inv) => sum + Number(inv.returnsReceived),
      0,
    );

    // Projects owned by user
    const projects = await this.projectRepo.find({
      where: { ownerId: userId },
      relations: ['investments'],
    });

    const totalRaised = projects.reduce(
      (sum, proj) => sum + Number(proj.currentAmount),
      0,
    );

    return {
      asInvestor: {
        totalInvestments: investments.length,
        activeInvestments,
        totalInvested,
        totalReturns,
        roi: totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0,
        portfolioValue: totalInvested + totalReturns,
      },
      asProjectOwner: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        fundedProjects: projects.filter(p => p.status === 'funded').length,
        totalRaised,
        totalInvestors: projects.reduce(
          (sum, proj) => sum + (proj.investments?.length || 0),
          0,
        ),
      },
      recentInvestments: investments.slice(0, 5).map(inv => ({
        id: inv.id,
        amount: inv.amount,
        projectTitle: inv.project?.title,
        status: inv.status,
        returnsReceived: inv.returnsReceived,
        investedAt: inv.investedAt,
      })),
      projectsSummary: projects.slice(0, 5).map(proj => ({
        id: proj.id,
        title: proj.title,
        targetAmount: proj.targetAmount,
        currentAmount: proj.currentAmount,
        status: proj.status,
        investorCount: proj.investments?.length || 0,
        fundingProgress: ((Number(proj.currentAmount) / Number(proj.targetAmount)) * 100).toFixed(1),
      })),
    };
  }

  async getEquipmentOwnerDashboard(userId: number) {
    const equipment = await this.equipmentRepo.find({
      where: { ownerId: userId },
      relations: ['owner'],
    });

    const bookings = await this.bookingRepo.find({
      relations: ['equipment', 'equipment.owner'],
    });

    const userBookings = bookings.filter(
      b => b.equipment?.ownerId === userId,
    );

    // Calculate earnings based on booking duration and equipment price
    const calculateBookingPrice = (booking: any) => {
      if (!booking.equipment || !booking.startDate || !booking.endDate) return 0;
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days * Number(booking.equipment.pricePerDay);
    };

    const totalEarnings = userBookings
      .filter(b => b.status === BookingStatus.APPROVED)
      .reduce((sum, b) => sum + calculateBookingPrice(b), 0);

    const activeBookings = userBookings.filter(
      b => b.status === BookingStatus.APPROVED || b.status === BookingStatus.PENDING,
    ).length;

    return {
      equipment: {
        total: equipment.length,
        available: equipment.filter(e => e.availability).length,
        unavailable: equipment.filter(e => !e.availability).length,
      },
      bookings: {
        total: userBookings.length,
        active: activeBookings,
        completed: userBookings.filter(b => b.status === BookingStatus.APPROVED).length,
        cancelled: userBookings.filter(b => b.status === BookingStatus.CANCELED).length,
      },
      earnings: {
        total: totalEarnings,
        thisMonth: userBookings
          .filter(
            b =>
              (b.status === BookingStatus.APPROVED) &&
              new Date(b.startDate).getMonth() === new Date().getMonth(),
          )
          .reduce((sum, b) => sum + calculateBookingPrice(b), 0),
      },
      recentBookings: userBookings.slice(0, 5).map(b => ({
        id: b.id,
        equipmentName: b.equipment?.name,
        startDate: b.startDate,
        endDate: b.endDate,
        totalPrice: calculateBookingPrice(b),
        status: b.status,
      })),
      topEquipment: equipment.slice(0, 5).map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        pricePerDay: e.pricePerDay,
        availability: e.availability,
      })),
    };
  }

  async getCarrierDashboard(userId: number) {
    const carrier = await this.carrierRepo.findOne({
      where: { userId },
    });

    if (!carrier) {
      return {
        isCarrier: false,
        message: 'User is not registered as a carrier',
      };
    }

    const deliveries = await this.deliveryRepo.find({
      where: { carrierId: carrier.id },
      order: { id: 'DESC' },
    });

    const totalEarnings = deliveries
      .filter(d => d.status === 'DELIVERED')
      .reduce((sum, d) => sum + Number(d.totalCost || 0), 0);

    // Can't filter by month without createdAt, use all deliveries
    const thisMonthEarnings = totalEarnings; // Fallback

    return {
      isCarrier: true,
      carrier: {
        companyName: carrier.companyName,
        averageRating: carrier.averageRating,
        totalReviews: carrier.totalReviews,
        status: carrier.status,
        capacity: carrier.capacity_kg,
      },
      deliveries: {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'PENDING_PICKUP').length,
        inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
        delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
        cancelled: deliveries.filter(d => d.status === 'CANCELLED').length,
      },
      earnings: {
        total: totalEarnings,
        thisMonth: thisMonthEarnings,
        averagePerDelivery:
          deliveries.length > 0 ? totalEarnings / deliveries.length : 0,
      },
      recentDeliveries: deliveries.slice(0, 10).map(d => ({
        id: d.id,
        goodsType: d.goodsType,
        weight: d.weight_kg,
        pickupAddress: d.pickupAddress,
        deliveryAddress: d.deliveryAddress,
        totalCost: d.totalCost,
        status: d.status,
        desiredDeliveryDate: d.desiredDeliveryDate,
      })),
    };
  }

  async getRecentActivities(userId: number) {
    const [orders, investments, bookings, deliveries] = await Promise.all([
      this.orderRepo.find({
        where: { userId: userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.investmentRepo.find({
        where: { investorId: userId },
        relations: ['project'],
        order: { investedAt: 'DESC' },
        take: 5,
      }),
      this.bookingRepo.find({
        where: { userId: userId },
        relations: ['equipment', 'user'],
        order: { startDate: 'DESC' },
        take: 5,
      }),
      this.deliveryRepo.find({
        where: { userId: userId },
        relations: ['user'],
        order: { id: 'DESC' },
        take: 5,
      }),
    ]);

    const activities: any[] = [];

    orders.forEach(o =>
      activities.push({
        type: 'order',
        id: o.id,
        description: `Order #${o.id} - ${o.status}`,
        amount: o.total,
        date: o.createdAt,
      }),
    );

    investments.forEach(i =>
      activities.push({
        type: 'investment',
        id: i.id,
        description: `Invested in ${i.project?.title}`,
        amount: i.amount,
        date: i.investedAt,
      }),
    );

    bookings.forEach(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const amount = b.equipment ? days * Number(b.equipment.pricePerDay) : 0;
      
      activities.push({
        type: 'booking',
        id: b.id,
        description: `Booked ${b.equipment?.name}`,
        amount: amount,
        date: b.startDate,
      });
    });

    deliveries.forEach(d =>
      activities.push({
        type: 'delivery',
        id: d.id,
        description: `Delivery ${d.goodsType} - ${d.status}`,
        amount: d.totalCost,
        date: d.desiredDeliveryDate,
      }),
    );

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }
}
