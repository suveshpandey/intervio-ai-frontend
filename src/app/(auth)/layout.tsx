import { ForceLight } from '@/components/force-light';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLight />
      {children}
    </>
  );
}
