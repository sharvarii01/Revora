import { customerRepository } from '../repositories/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto, CustomerProfileDto } from '../types/customer.types';
import { NotFoundError } from '../utils/errors';

export class CustomerService {
  async listCustomers(merchantId: string, limit = 50, offset = 0, search?: string) {
    const { data, total } = await customerRepository.list(merchantId, limit, offset, search);

    const formatted: CustomerProfileDto[] = data.map((c: any) => ({
      id: c.id,
      name: c.name || 'Customer',
      email: c.email || '',
      phone: c.phone || '',
      vpa: c.vpa || '',
      memberSince: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lifetimeValue: (c.subscriptions || []).reduce((sum: number, s: any) => sum + (s.amount || 0) * 12, 0),
      totalRecovered: c.lifetimeRecovered || 0,
      totalLost: c.lifetimeLost || 0,
      riskScore: c.riskScore || 15,
      recoveryProbability: c.recoveryProbability || 80,
      healthScore: c.healthScore || 85,
      optedOut: !!c.optedOut,
      activeSubscriptionsCount: (c.subscriptions || []).filter((s: any) => s.status === 'active').length,
      paymentHistoryCount: (c.subscriptions?.length || 0) + (c.recoverySessions?.length || 0),
    }));

    return { data: formatted, total };
  }

  async getCustomerById(id: string, merchantId: string): Promise<CustomerProfileDto> {
    const c: any = await customerRepository.findById(id, merchantId);
    if (!c) throw new NotFoundError('Customer not found.');

    return {
      id: c.id,
      name: c.name || 'Customer',
      email: c.email || '',
      phone: c.phone || '',
      vpa: c.vpa || '',
      memberSince: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      lifetimeValue: (c.subscriptions || []).reduce((sum: number, s: any) => sum + (s.amount || 0) * 12, 0),
      totalRecovered: c.lifetimeRecovered || 0,
      totalLost: c.lifetimeLost || 0,
      riskScore: c.riskScore || 15,
      recoveryProbability: c.recoveryProbability || 80,
      healthScore: c.healthScore || 85,
      optedOut: !!c.optedOut,
      activeSubscriptionsCount: (c.subscriptions || []).filter((s: any) => s.status === 'active').length,
      paymentHistoryCount: (c.subscriptions?.length || 0) + (c.recoverySessions?.length || 0),
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

  async deleteCustomer(id: string, merchantId: string) {
    const existing = await customerRepository.findById(id, merchantId);
    if (!existing) throw new NotFoundError('Customer not found.');

    return customerRepository.delete(id, merchantId);
  }
}

export const customerService = new CustomerService();
