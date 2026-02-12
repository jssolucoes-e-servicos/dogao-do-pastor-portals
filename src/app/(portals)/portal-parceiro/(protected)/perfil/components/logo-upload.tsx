"use client"

import Cookies from "js-cookie"
import { Camera, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchApi, FetchCtx } from "@/lib/api"

interface LogoUploadProps {
  partnerId: string;
  currentLogo?: string;
}

export function LogoUpload({ partnerId, currentLogo }: LogoUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB")
      return
    }

    const formData = new FormData()
    formData.append("logo", file)

    setIsUploading(true)

    try {
      // POST para o backend via upload service integrado ao partner
      const response = await fetchApi(FetchCtx.PARTNER, `/partners/${partnerId}/logo`, {
        method: "POST",
        body: formData,
      })

      // Sincroniza o cookie para atualizar o Header/Sidebar
      const rawCookie = Cookies.get("ddp-prt-01")
      if (rawCookie) {
        try {
          const sessionData = JSON.parse(rawCookie)
          sessionData.logo = response.logo
          Cookies.set("ddp-prt-01", JSON.stringify(sessionData), { expires: 1 })
        } catch (e) {
          console.error("Erro ao parsear cookie:", e)
        }
      }

      toast.success("Logo atualizada com sucesso!")
      router.refresh()
    } catch (error: any) {
      console.error("Erro no upload:", error)
      toast.error(error.message || "Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
          <AvatarImage src={currentLogo} alt="Logo" className="object-cover" />
          <AvatarFallback className="bg-slate-100 text-slate-400">
            <Camera className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 bg-slate-900 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center leading-tight">
        Logo da Instituição<br/>
        <span className="font-normal text-[9px] lowercase opacity-70">jpg, png ou webp (max 2mb)</span>
      </p>
    </div>
  )
}