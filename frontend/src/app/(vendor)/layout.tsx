import { VendorLayout } from '@/components/vendor';

export default function VendorAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VendorLayout>{children}</VendorLayout>;
}
