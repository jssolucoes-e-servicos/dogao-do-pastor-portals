// src/components/erp/profile/contributor-photo-upload.tsx
"use client"

import Cookies from "js-cookie"
import { Camera, Loader2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchApi, FetchCtx } from "@/lib/api"

interface Props {
  contributorId: string;
  currentPhoto?: string;
  name: string;
}

export function ProfilePhotoUpload({ contributorId, currentPhoto, name }: Props) {
  const router = useRouter()
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validação de tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB")
      return
    }

    const formData = new FormData()
    formData.append("photo", file)

    setIsUploading(true)

    try {
      // POST para contributors/:id/photo
      const response = await fetchApi(FetchCtx.ERP, `/contributors/${contributorId}/photo`, {
        method: "POST",
        body: formData,
      })

      // ATUALIZAÇÃO DO COOKIE PARA O LAYOUT (HEADER/SIDEBAR)
      const rawCookie = Cookies.get("ddp-ctb-01")
      if (rawCookie) {
        try {
          // 1. Decodifica o valor atual (Next.js salva encodado)
          const sessionData = JSON.parse(decodeURIComponent(rawCookie))
          
          // 2. Atualiza apenas a foto com o retorno da API
          sessionData.photo = response.photo
          
          // 3. Salva de volta encodado com PATH "/" para o Server Side ler
          const updatedCookieValue = encodeURIComponent(JSON.stringify(sessionData))
          
          Cookies.set("ddp-ctb-01", updatedCookieValue, { 
            expires: 7, 
            path: "/" // ESSENCIAL para o layout.tsx enxergar a mudança
          })

          toast.success("Foto de perfil atualizada!")
          
          // Força o reload completo para o Layout (Server Component) ler o novo cookie
          window.location.reload()
          
        } catch (e) {
          console.error("Erro ao sincronizar cookie de sessão:", e)
          toast.error("Erro ao atualizar sessão local")
        }
      }
    } catch (error: any) {
      console.error("Erro no upload da foto:", error)
      toast.error(error.message || "Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-xl transition-transform group-hover:scale-[1.02]">
          {/* Cache-bust com timestamp para garantir que o navegador não mostre a foto antiga se a URL for a mesma */}
          <AvatarImage 
            src={currentPhoto ? `${currentPhoto}?t=${new Date().getTime()}` : undefined} 
            alt={name} 
            className="object-cover" 
          />
          <AvatarFallback className="bg-orange-600 text-white text-4xl font-black uppercase">
            {name?.charAt(0) || <User size={40} />}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-10">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50 border-2 border-white dark:border-slate-900 z-20"
          title="Alterar foto"
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
      
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">
          Foto de Perfil
        </p>
        <p className="text-[9px] text-slate-400 lowercase opacity-70 mt-1">
          jpg, png ou webp (max 2mb)
        </p>
      </div>
    </div>
  )
}