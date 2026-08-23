import { customerRepository } from '../repositories/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto, CustomerProfileDto } from '../types/customer.types';
import { NotFoundError } from '../utils/errors';

export class CustomerService {
  async listCustomers(merchantId: string, limit = 50, offset = 0, search?: string) {
    const { data, total } = await customerRepository.list(merchantId, limit, offset, search);

    const formatted: CustomerProfileDto[] = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      vpa: c.vpa,
      memberSince: c.createdAt.toISOString().split('T')[0],
      lifetimeValue: c.subscriptions.reduce((sum: number, s: any) => sum + s.amount * 12, 0),
      totalRecovered: c.lifetimeRecovered,
      totalLost: c.lifetimeLost,
      riskScore: c.riskScore,
      recoveryProbability: c.recoveryProbability,
      healthScore: c.healthScore,
      optedOut: c.optedOut,
      activeSubscriptionsCount: c.subscriptions.filter((s: any) => s.status === 'active').length,
      paymentHistoryCount: c.subscriptions.length + (c.recoverySessions?.length || 0),
    }));

    return { data: formatted, total };
  }

  async getCustomerById(id: string, merchantId: string): Promise<CustomerProfileDto> {
    const c: any = await customerRepository.findById(id, merchantId);
    if (!c) throw new NotFoundError('Customer not found.');

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      vpa: c.vpa,
      memberSince: c.createdAt.toISOString().split('T')[0],
      lifetimeValue: c.subscriptions.reduce((sum: number, s: any) => sum + s.amount * 12, 0),
      totalRecovered: c.lifetimeRecovered,
      totalLost: c.lifetimeLost,
      riskScore: c.riskScore,
      recoveryProbability: c.recoveryProbability,
      healthScore: c.healthScore,
      optedOut: c.optedOut,
      activeSubscriptionsCount: c.subscriptions.filter((s: any) => s.status === 'active').length,
      paymentHistoryCount: c.subscriptions.length + (c.recoverySessions?.length || 0),
    };
  }

  async createCustomer(merchantId: string, data: CreateCustomerDto) {
    return customerRepository.create({
      merchantId,
      ...data,
    });
  }

  async updateCustomer(id: string, merchantId: string, data: UpdateCustomerDto) {
    const existing = await customerRepository.findById(id, merchantId);
    if (!existing) throw new NotFoundError('Customer not found.');

    return customerRepository.update(id, merchantId, data);
  }
}

export const customerService = new CustomerService();
