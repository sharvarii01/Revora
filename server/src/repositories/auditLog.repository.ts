import { AuditLogModel, IAuditLog } from '../models/AuditLog.model';

export class AuditLogRepository {
  async list(merchantId: string, limit = 50, offset = 0): Promise<{ data: any[]; total: number }> {
    const filter = { merchantId: { $in: [merchantId, 'mer_demo_1'] } };
    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      AuditLogModel.countDocuments(filter),
    ]);
    return {
      data: logs.map((l: any) => ({
        ...l,
        id: l._id.toString(),
        timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
      })),
      total,
    };
  }

  async create(data: {
    merchantId: string;
    eventType: string;
    entityType: string;
    entityId: string;
    title?: string;
    description: string;
    customerName?: string;
    amount?: number;
    status?: string;
    metadataJson?: string;
    complianceTag?: string;
    complianceHash?: string;
  }): Promise<any> {
    const doc = await AuditLogModel.create(data);
    return { ...doc.toJSON(), id: doc._id.toString() };
  }
}

export const auditLogRepository = new AuditLogRepository();
