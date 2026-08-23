'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto bg-white rounded-3xl border border-slate-200 shadow-xs">
      <table className={cn('w-full caption-bottom text-base', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('[&_tr]:border-b border-slate-200 bg-slate-50/80 text-slate-600', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0 divide-y divide-slate-100', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-slate-100 min-h-[64px] transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-14 px-6 text-left align-middle font-bold text-slate-500 text-sm uppercase tracking-wider [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('py-5 px-6 align-middle text-base text-slate-800 font-medium [&:has([role=checkbox])]:pr-0', className)} {...props}>
      {children}
    </td>
  );
}
