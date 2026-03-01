// src/components/erp/profile/profile-header.tsx
"use client"

import { ContributorEntity } from "@/common/entities"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useState } from "react"
import { ProfileEditModal } from "./profile-edit-modal"
import { ProfilePhotoUpload } from "./profile-photo-upload"

interface ProfileHeaderProps {
  contributor: ContributorEntity
}

export function ProfileHeader({ contributor }: ProfileHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(contributor.createdAt))

  return (
    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 bg-gradient-to-b from-orange-50/50 to-white dark:from-slate-900/50 dark:to-background p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      <ProfilePhotoUpload 
        contributorId={contributor.id} 
        currentPhoto={contributor.photo ?? undefined} 
        name={contributor.name} 
      />

      <div className="flex-1 text-center md:text-left space-y-3">
        <div className="space-y-1">
          <h2 className="text-4xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
            {contributor.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
              @{contributor.username}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-tight">Membro desde {dateFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-auto">
        <Button 
          onClick={() => setIsEditOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 font-black uppercase text-[11px] h-11 px-8 shadow-lg shadow-orange-600/20 rounded-xl"
        >
          Editar Cadastro
        </Button>
      </div>

      <ProfileEditModal 
        contributor={contributor} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
    </div>
  )
}