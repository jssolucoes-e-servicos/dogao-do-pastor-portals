import { PartnerHeader } from "@/components/partners/header";
import { Toaster } from "@/components/ui/sonner";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PartnerHeader />
      <main className="max-w-7xl mx-auto py-8 px-4">
        {children}
         <Toaster richColors position="bottom-right" />
      </main>
    </div>
  )
}