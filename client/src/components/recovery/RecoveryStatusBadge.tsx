'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { RecoveryStatus } from '@/types/recovery';

export function RecoveryStatusBadge({ status }: { status: RecoveryStatus }) {
  switch (status) {
    case 'ANALYZING_AI':
      return (
        <Badge variant="info" dot>
          Analyzing AI
        </Badge>
      );
    case 'SCHEDULED_RETRY':
      return (
        <Badge variant="warning" dot>
          Retry Scheduled
        </Badge>
      );
    case 'PAYMENT_LINK_SENT':
      return (
        <Badge variant="default" dot>
          Link Dispatched
        </Badge>
      );
    case 'RETRY_IN_PROGRESS':
      return (
        <Badge variant="warning" dot>
          Debiting Bank
        </Badge>
      );
    case 'RECOVERED_AUTO_DEBIT':
      return (
        <Badge variant="success" dot>
          Recovered (AutoPay)
        </Badge>
      );
    case 'RECOVERED_VIA_LINK':
      return (
        <Badge variant="success" dot>
          Recovered (Link)
        </Badge>
      );
    case 'STOP_NPCI_LIMIT_REACHED':
      return (
        <Badge variant="secondary" dot>
          Halted (NPCI 3/3 Cap)
        </Badge>
      );
    case 'STOP_TERMINAL_FAILURE':
      return (
        <Badge variant="danger" dot>
          Hard Stop (Terminal)
        </Badge>
      );
    case 'STOP_CUSTOMER_OPTED_OUT':
      return (
        <Badge variant="secondary" dot>
          Customer Opted Out
        </Badge>
      );
    case 'STOP_DISCOUNT_FLOOR_EXCEEDED':
      return (
        <Badge variant="secondary" dot>
          Discount Floor Stop
        </Badge>
      );
    case 'STOP_MANUAL_CANCELLED':
      return (
        <Badge variant="secondary" dot>
          Cancelled by Admin
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
