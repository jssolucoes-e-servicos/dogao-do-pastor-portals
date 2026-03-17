'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Bell, Shield, Database, Save, Smartphone, MapPin, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { GetMeAction, UpdateMeAction } from "@/actions/contributors/me.action";
import { GetActiveEditionAction } from "@/actions/editions/get-active-edition.action";
import { toast } from "sonner";
import Link from "next/link";

export default function ConfiguracoesPage() {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: profileRes, mutate: mutateProfile } = useSWR(
    mounted ? 'me' : null,
    () => GetMeAction()
  );

  const { data: editionRes } = useSWR(
    mounted ? 'active-edition' : null,
    () => GetActiveEditionAction()
  );

  const profile = profileRes?.data as any;
  const activeEdition = editionRes?.data as any;

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
    };

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password) {
      if (password !== confirmPassword) {
        toast.error("As senhas não conferem");
        setIsSaving(false);
        return;
      }
      (data as Record<string, unknown>).password = password;
    }

    const res = await UpdateMeAction(data);
    if (res.success) {
      toast.success("Perfil atualizado com sucesso!");
      mutateProfile();
    } else {
      toast.error(res.error || "Erro ao atualizar perfil");
    }
    setIsSaving(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/10 dark:bg-white">
          <Settings className="h-6 w-6 text-white dark:text-slate-900" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Configurações do <span className="text-orange-600">Sistema</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
            Gestão Global • Preferências & Segurança
          </p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-2">
            <TabsList className="bg-transparent h-auto flex-col items-stretch justify-start p-0 space-y-1">
              {[
                { id: 'geral', label: 'Geral', icon: Settings },
                { id: 'perfil', label: 'Meu Perfil', icon: User },
                { id: 'notificacoes', label: 'Notificações', icon: Bell },
                { id: 'seguranca', label: 'Segurança', icon: Shield },
                { id: 'sistema', label: 'Integrações', icon: Database },
                { id: 'mobile', label: 'App Mobile', icon: Smartphone },
              ].map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="justify-start px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-orange-600 dark:border-slate-800"
                >
                  <item.icon className="h-3.5 w-3.5 mr-3" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </aside>

          <main className="flex-1">
            <TabsContent value="geral" className="mt-0 space-y-6">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic">Informações da Organização</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase text-slate-400">Configure os dados principais que aparecem nos recibos e documentos</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome da Instituição</Label>
                      <Input defaultValue="DOGÃO DO PASTOR" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CNPJ / Identificador</Label>
                      <Input defaultValue="00.000.000/0000-00" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail para Contato</Label>
                      <Input defaultValue="contato@dogaodopastor.com.br" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone Suporte</Label>
                      <Input defaultValue="(00) 00000-0000" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-xs" />
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-100 dark:bg-slate-800" />
                  
                  <div className="flex justify-end">
                    <Button disabled className="h-12 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
                      <Save className="h-3.5 w-3.5" /> Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic">Edição Vigente</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase text-slate-400">Status da edição ativa no sistema</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                           <Save className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase text-slate-900 dark:text-white leading-tight">
                            {activeEdition ? `${activeEdition.name} (Código ${activeEdition.editionNumber})` : 'Carregando edição...'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {activeEdition?.active ? 'Edição ativa e recebendo pedidos' : 'Edição inativa'}
                          </p>
                        </div>
                      </div>
                      <Link href="/erp/edicoes">
                        <Button asChild variant="outline" className="h-10 rounded-xl font-bold uppercase text-[9px] tracking-widest border-slate-200">
                          <span>Gerenciar Edições</span>
                        </Button>
                      </Link>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perfil" className="mt-0 space-y-6">
              <form onSubmit={handleUpdateProfile}>
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                  <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                      <User className="h-6 w-6 text-orange-600" /> Meu Perfil
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase text-slate-400">Gerencie suas informações pessoais e credenciais de acesso</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
                      <div className="relative group">
                        <div className="h-24 w-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
                          {profile?.photo ? <img src={profile.photo as string} className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-300" />}
                        </div>
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-black uppercase italic leading-tight">{profile?.name || 'Carregando...'}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username: @{profile?.username}</p>
                      </div>
                    </div>

                    <Separator className="bg-slate-50 dark:bg-slate-800/50" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</Label>
                        <Input name="name" defaultValue={profile?.name} className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username / Login</Label>
                        <Input name="username" defaultValue={profile?.username} className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 ml-1">Alterar Senha</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nova Senha</Label>
                          <Input name="password" type="password" placeholder="••••••••" className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Nova Senha</Label>
                          <Input name="confirmPassword" type="password" placeholder="••••••••" className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button disabled={isSaving} className="h-14 px-10 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-slate-900/10">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Atualizar Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>

            <TabsContent value="notificacoes" className="mt-0 space-y-6">
               <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                    <Bell className="h-6 w-6 text-orange-600" /> Preferências de Notificação
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase text-slate-400">Escolha como você quer ser avisado sobre as atividades do sistema</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-4">
                      {[
                        { title: "Novos Pedidos (WhatsApp)", desc: "Receber alerta instantâneo via EvolutionAPI para cada novo pedido pago", active: true },
                        { title: "Relatórios Diários", desc: "Receber o resumo de vendas ao final do dia", active: true },
                        { title: "Status do Estoque", desc: "Avisar quando o limite de Dogões da edição estiver chegando ao fim", active: false },
                        { title: "Alertas de Segurança", desc: "Notificar sobre novos logins em dispositivos desconhecidos", active: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                           <div>
                              <p className="font-black text-xs uppercase text-slate-900 dark:text-white">{item.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
                           </div>
                           <div className={`h-6 w-11 rounded-full relative transition-colors cursor-pointer ${item.active ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="flex justify-end pt-4">
                    <Button disabled className="h-14 px-10 rounded-[1.5rem] bg-orange-600 hover:bg-orange-700 text-white transition-all font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-orange-600/20">
                      <Save className="h-4 w-4" /> Salvar Preferências
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguranca" className="mt-0 space-y-6">
               <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                      <Shield className="h-6 w-6 text-orange-600" /> Segurança & Acesso
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase text-slate-400">Monitore acessos recentes e configure camadas extras de proteção</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Autenticação de Dois Fatores (2FA)</h4>
                           <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-4">
                              <Smartphone className="h-10 w-10 text-slate-200" />
                              <p className="text-[10px] font-bold uppercase text-slate-400">Proteja sua conta usando um aplicativo de autenticação (Google Authenticator / Authy)</p>
                              <Button variant="outline" className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest border-slate-200 hover:bg-slate-50">ATIVAR AGORA</Button>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Sessões Ativas</h4>
                           <div className="space-y-3">
                              {[
                                { device: "Chrome no MacOS", ip: "189.120.45.10", current: true },
                                { device: "iPhone 15 Pro", ip: "177.85.20.144", current: false },
                              ].map((session, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                                   <div className="flex items-center gap-3">
                                      <div className={`h-2 w-2 rounded-full ${session.current ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                      <div>
                                         <p className="font-bold text-[11px] uppercase text-slate-900 dark:text-white">{session.device}</p>
                                         <p className="text-[9px] font-medium text-slate-400">{session.ip}</p>
                                      </div>
                                   </div>
                                   {!session.current && <button className="text-[9px] font-black text-red-500 uppercase hover:underline">Sair</button>}
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="sistema" className="mt-0 space-y-6">
               <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                    <Database className="h-6 w-6 text-orange-600" /> Integrações & APIs
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase text-slate-400">Tokens de acesso e configurações de serviços externos</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                         <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Smartphone className="h-5 w-5" />
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white italic">EvolutionAPI (WhatsApp Gateway)</h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Evolution URL</Label>
                            <Input defaultValue="https://evolution.dogaodopastor.com" className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instance Name</Label>
                            <Input defaultValue="dogao-prod" className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                         </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">API Key / Token</Label>
                            <Input type="password" defaultValue="dogaopastor_token_2026_xyz123" className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                         </div>
                      </div>
                   </div>

                   <Separator className="bg-slate-50 dark:bg-slate-800/50" />

                   <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                         <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <MapPin className="h-5 w-5" />
                         </div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white italic">Google Maps Platform</h4>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Google Maps API Key</Label>
                         <Input type="password" defaultValue="AIzaSyA_Ghf784_Dogao_Maps_key" className="h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 px-6 font-bold text-xs" />
                      </div>
                   </div>

                   <div className="flex justify-end pt-4">
                    <Button disabled className="h-14 px-10 rounded-[1.5rem] bg-slate-900 text-white transition-all font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl">
                      <Save className="h-4 w-4" /> Salvar Integrações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mobile" className="mt-0 space-y-6">
               <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white italic flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-orange-600" /> App Mobile & Terminal
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase text-slate-400">Acesse o sistema via dispositivos móveis para entregadores e parceiros</CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex flex-col items-center text-center space-y-8">
                   <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl border-8 border-slate-50 dark:border-slate-950">
                      {/* Simulação de QR Code */}
                      <div className="h-48 w-48 bg-slate-900 flex items-center justify-center rounded-[1.5rem] text-white">
                         <QrCode className="h-32 w-32" />
                      </div>
                   </div>
                   
                   <div className="max-w-xs space-y-2">
                      <h4 className="text-sm font-black uppercase italic">Escaneie para Instalar</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disponível para Android (APK) e iOS (PWA)</p>
                   </div>

                   <Separator className="w-full max-w-md bg-slate-100 dark:bg-slate-800" />

                   <div className="w-full max-w-md grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 flex flex-col items-center gap-2">
                         <span className="text-[9px] font-black text-emerald-600 uppercase">Sincronização</span>
                         <span className="text-xs font-black uppercase italic text-emerald-900 dark:text-emerald-400">EM TEMPO REAL</span>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/30 border border-slate-100 flex flex-col items-center gap-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase">Versão App</span>
                         <span className="text-xs font-black uppercase italic text-slate-900 dark:text-white">v2.4.0 PROD</span>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
          </main>
        </div>
      </Tabs>
    </div>
  );
}
