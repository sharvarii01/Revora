import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SimulatorProvider } from '@/context/SimulatorContext';

export const metadata: Metadata = {
  title: 'Revora – AI Revenue Recovery Platform',
  description: 'Autonomous AI Revenue Recovery Platform for Razorpay & NPCI UPI AutoPay. Recover failed payments with smart retry scheduling, WhatsApp nudges, and full regulatory compliance.',
  keywords: ['revenue recovery', 'payment recovery', 'UPI AutoPay', 'NPCI', 'Razorpay', 'AI platform', 'Revora'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <AuthProvider>
          <SimulatorProvider>{children}</SimulatorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
