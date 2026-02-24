// src/components/security/change-password-modal.tsx
'use client';

import { UserTypesEnum } from '@/common/enums';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi, FetchCtx } from '@/lib/api';
import { ArrowRight, KeyRound, Loader2, Lock, MessageCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Step = 'REQUEST' | 'VERIFY' | 'NEW_PASSWORD';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  typeUser: UserTypesEnum;
}

export function ChangePasswordModal({ isOpen, onClose, userId, typeUser  }: ChangePasswordModalProps) {
  const [step, setStep] = useState<Step>('REQUEST');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [validationToken, setValidationToken] = useState<string | null>(null);
  
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

  const resetModal = () => {
    setStep('REQUEST');
    setOtp('');
    setValidationToken(null);
    setPasswords({ new: '', confirm: '' });
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await fetchApi(FetchCtx.PARTNER,'/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ userId, type: typeUser }),
      });
      setStep('VERIFY');
      toast.success("Código enviado ao seu WhatsApp!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(FetchCtx.PARTNER, '/auth/validate-otp', {
        method: 'POST',
        body: JSON.stringify({ userId, code: otp }),
      });

      if (data.otpValid) {
        setValidationToken(data.token);
        setStep('NEW_PASSWORD');
        toast.success("Código validado!");
      } else {
        toast.error("Código incorreto ou expirado.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na validação.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (passwords.new !== passwords.confirm) {
      return toast.error("As senhas não coincidem!");
    }

    if (passwords.new.length < 6) {
      return toast.error("A senha deve ter pelo menos 6 caracteres.");
    }

    setLoading(true);
    try {
      await fetchApi(FetchCtx.PARTNER, '/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ 
          userId,
          type: typeUser,
          token: validationToken,
          password: passwords.new
        }),
      });

      toast.success("Senha atualizada com sucesso!");
      onClose();
      resetModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar nova senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => { 
        if (!open) { 
          resetModal(); 
          onClose(); 
        } 
      }}
    >
      <DialogContent 
        className="sm:max-w-[400px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-black uppercase tracking-tighter text-foreground">
            <ShieldCheck className="text-orange-600 w-5 h-5" /> Segurança da Conta
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 'REQUEST' && (
            <div className="space-y-6 text-center">
              {/* Ajustado: bg-green-500/10 no dark mode e border-green-500/20 */}
              <div className="bg-green-50 dark:bg-green-500/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto border-2 border-green-100 dark:border-green-500/20">
                <MessageCircle className="text-green-600 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-foreground">Verificação via WhatsApp</p>
                <p className="text-sm text-muted-foreground px-4">
                  Para alterar sua senha, precisamos confirmar sua identidade enviando um código para o número cadastrado.
                </p>
              </div>
              <Button onClick={handleSendOtp} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 h-14 gap-2 font-bold shadow-lg shadow-green-600/20 border-none">
                {loading ? <Loader2 className="animate-spin" /> : "RECEBER CÓDIGO"}
              </Button>
            </div>
          )}

          {step === 'VERIFY' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="uppercase text-[10px] font-black tracking-widest text-center block text-muted-foreground">Código de 6 dígitos</Label>
                <Input 
                  placeholder="000 000" 
                  className="text-center text-3xl h-16 font-black tracking-[0.3em] border-2 focus-visible:ring-orange-500 bg-background"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <Button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className="w-full h-14 font-bold bg-primary text-primary-foreground gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <>VERIFICAR AGORA <ArrowRight className="w-4 h-4" /></>}
              </Button>
              <button 
                type="button"
                onClick={() => setStep('REQUEST')} 
                className="w-full text-xs text-muted-foreground font-bold uppercase hover:underline hover:text-foreground transition-colors"
              >
                Reenviar código
              </button>
            </div>
          )}

          {step === 'NEW_PASSWORD' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-orange-600 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Nova Senha
                </Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  className="bg-background"
                  value={passwords.new} 
                  onChange={e => setPasswords({...passwords, new: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Confirmar Nova Senha
                </Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  className="bg-background"
                  value={passwords.confirm} 
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                />
              </div>
              <Button onClick={handleFinish} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 h-14 font-black uppercase mt-4 shadow-lg shadow-orange-600/20 border-none">
                {loading ? <Loader2 className="animate-spin" /> : "SALVAR NOVA SENHA"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}