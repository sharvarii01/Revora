'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/utils/cn';

interface TabsContextType {
  value: string;
  onChange: (val: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const onChange = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600 border border-slate-200',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const isSelected = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-slate-900 shadow-xs'
          : 'text-slate-500 hover:text-slate-900 hover:bg-white/50',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  if (context.value !== value) return null;

  return <div className={cn('mt-3 ring-offset-background focus-visible:outline-none', className)}>{children}</div>;
}
