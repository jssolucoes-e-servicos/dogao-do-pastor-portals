import { fetchApi, FetchCtx } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Calendar, Dog, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

async function getWithdrawal(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ddp-ctb-00")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/v1/donations/withdrawal/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pendente', CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
};

export default async function ResgateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const withdrawal = await getWithdrawal(id);

  if (!withdrawal) return notFound();

  const totalItems = withdrawal.items?.length || 0;
  const groups = new Map<string, { label: string; quantity: number }>();
  (withdrawal.items || []).forEach((item: any) => {
    const key = (item.removedIngredients || []).sort().join('|') || 'completo';
    const label = item.removedIngredients?.length > 0
      ? `Sem: ${item.removedIngredients.join(', ')}` : 'Dogão Completo';
    if (groups.has(key)) groups.get(key)!.quantity++;
    else groups.set(key, { label, quantity: 1 });
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/erp/doacoes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">Resgate de Doação</h2>
          <p className="text-muted-foreground text-sm font-mono">#{id.slice(-8).toUpperCase()}</p>
        </div>
        <Badge className="ml-auto">{statusLabel[withdrawal.status] || withdrawal.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Building2 className="h-4 w-4 text-emerald-600" /> Instituição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-black text-lg">{withdrawal.partner?.name}</p>
            <p className="text-sm text-muted-foreground">{withdrawal.partner?.responsibleName}</p>
            <p className="text-sm text-muted-foreground">{withdrawal.partner?.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Calendar className="h-4 w-4 text-orange-600" /> Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-black text-lg">
              {withdrawal.scheduledAt
                ? new Date(withdrawal.scheduledAt).toLocaleString('pt-BR')
                : '—'}
            </p>
            <p className="text-sm text-muted-foreground">
              Solicitado em {new Date(withdrawal.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Dog className="h-4 w-4 text-orange-600" /> Itens — {totalItems} dogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(groups.values()).map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-sm font-bold">{g.label}</span>
                  <Badge variant="outline">{g.quantity}x</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
