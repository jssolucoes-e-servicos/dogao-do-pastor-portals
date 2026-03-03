import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div className="space-y-2"><Skeleton className="h-10 w-48 bg-slate-200 dark:bg-slate-800" /><Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-800" /></div></div>
      <div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full bg-slate-200 dark:bg-slate-800" />)}</div>
      <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-96 w-full bg-slate-200 dark:bg-slate-800" />)}</div>
    </div>
  );
}