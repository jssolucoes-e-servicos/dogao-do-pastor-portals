"use client"

import ManualCommandForm from "@/components/erp/commands/manual-command-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ManualCommandPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lançamento Manual</h1>
          <p className="text-muted-foreground">Registre uma comanda física diretamente no sistema.</p>
        </div>
      </div>

      <div className="mt-4">
        <ManualCommandForm />
      </div>
    </div>
  )
}
