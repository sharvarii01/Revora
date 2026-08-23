export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id?: string;
        invoice_id?: string;
        method: string;
        amount_refunded: number;
        refund_status?: string | null;
        captured: boolean;
        description?: string;
        card_id?: string;
        bank?: string;
        wallet?: string;
        vpa?: string;
        email: string;
        contact: string;
        customer_id?: string;
        token_id?: string;
        error_code?: string;
        error_description?: string;
        error_source?: string;
        error_step?: string;
        error_reason?: string;
        notes?: Record<string, string>;
        created_at: number;
      };
    };
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        customer_id: string;
        status: string;
        current_start?: number;
        current_end?: number;
        ended_at?: number;
        quantity: number;
        notes?: Record<string, string>;
        charge_at?: number;
        start_at?: number;
        end_at?: number;
        auth_attempts?: number;
        total_count?: number;
        paid_count?: number;
        customer_notify?: boolean;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt?: string;
        status: string;
        attempts: number;
        created_at: number;
      };
    };
  };
  created_at: number;
}
