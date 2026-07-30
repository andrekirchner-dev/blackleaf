import { AppShell } from "@/components/layout/app-shell";

export default function EnvironmentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
