import {
  LayoutDashboard,
  RefreshCw,
  Users,
  Lightbulb,
  Settings,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & quick actions',
  },
  {
    title: 'Recoveries',
    href: '/recoveries',
    icon: RefreshCw,
    description: 'Active, subscriptions, checkout',
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Profiles & recovery history',
  },
  {
    title: 'Insights',
    href: '/insights',
    icon: Lightbulb,
    description: 'AI recommendations & analytics',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Connections & policy',
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [];
