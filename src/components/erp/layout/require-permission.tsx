'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

interface RequirePermissionProps {
  /** Slug do módulo necessário (ex: 'erp.finance') */
  slug: string;
  children: React.ReactNode;
}

/**
 * Wrapper que protege páginas client-side.
 * Se o usuário não tiver o slug, redireciona para /erp.
 *
 * Uso:
 *   export default function MinhaPage() {
 *     return (
 *       <RequirePermission slug="erp.finance">
 *         <ConteudoDaPagina />
 *       </RequirePermission>
 *     );
 *   }
 */
export function RequirePermission({ slug, children }: RequirePermissionProps) {
  const { canAccess, isIT, isAdmin, loading } = usePermissions();
  const router = useRouter();

  const isMaster = isIT() || isAdmin();
  const allowed = isMaster || canAccess(slug);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace('/erp');
    }
  }, [loading, allowed]);

  // Enquanto carrega permissões — mostra nada (evita flash)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Sem permissão — mostra mensagem enquanto redireciona
  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
          <Shield className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Acesso não autorizado
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
