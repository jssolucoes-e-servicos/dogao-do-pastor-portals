import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Política de Privacidade | Dogão do Pastor",
  description: "Política de Privacidade dos aplicativos e serviços Dogão do Pastor.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "29 de abril de 2026";

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
            Política de <span className="text-orange-600">Privacidade</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Última atualização: {lastUpdated}
          </p>
        </div>

        <Card className="border shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8">
            <CardTitle className="text-2xl">Compromisso com a sua Privacidade</CardTitle>
            <p className="text-primary-foreground/80 mt-2 font-light">
              No Dogão do Pastor, levamos a sério a proteção dos seus dados. Esta política descreve como coletamos, usamos e protegemos suas informações ao utilizar nossos aplicativos de gestão e equipe.
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-8 text-foreground leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Informações que Coletamos
              </h2>
              <p className="mb-4 text-muted-foreground">
                Para fornecer nossos serviços de gestão de equipe e vendas, coletamos os seguintes tipos de informações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li><strong>Dados de Identificação:</strong> Nome completo, CPF (quando necessário para fins fiscais ou contratuais) e foto de perfil.</li>
                <li><strong>Informações de Contato:</strong> Endereço de e-mail e número de telefone celular.</li>
                <li><strong>Dados de Localização:</strong> Coletamos sua localização em tempo real enquanto o aplicativo está em uso para fins de logística de entrega, atribuição de pedidos e coordenação da equipe de vendas.</li>
                <li><strong>Dados de Vendas e Operação:</strong> Registros de pedidos realizados, produtos vendidos, horários de trabalho e interações com clientes através da plataforma.</li>
                <li><strong>Dados do Dispositivo:</strong> Modelo do aparelho, sistema operacional e identificadores únicos para fins de segurança e notificações push.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Como Utilizamos seus Dados
              </h2>
              <p className="mb-4 text-muted-foreground">Seus dados são utilizados exclusivamente para:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Operacionalizar o sistema de vendas e gestão da equipe.</li>
                <li>Otimizar rotas de entrega e logística em tempo real.</li>
                <li>Processar pagamentos e gerar relatórios de desempenho.</li>
                <li>Enviar notificações importantes sobre pedidos e atualizações do sistema.</li>
                <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                Compartilhamento de Informações
              </h2>
              <p className="text-muted-foreground">
                Não vendemos seus dados pessoais a terceiros. O compartilhamento ocorre apenas em situações estritamente necessárias:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground/90">
                <li><strong>Gestão Interna:</strong> Com administradores da rede Dogão do Pastor para coordenação da equipe.</li>
                <li><strong>Provedores de Serviço:</strong> Empresas que nos auxiliam na infraestrutura de servidores, processamento de pagamentos e envio de notificações.</li>
                <li><strong>Obrigação Legal:</strong> Quando exigido por autoridades competentes em conformidade com a LGPD (Lei Geral de Proteção de Dados).</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                Segurança e Retenção
              </h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração. Seus dados são mantidos pelo período necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
                Seus Direitos (LGPD)
              </h2>
              <p className="mb-4 text-muted-foreground">
                De acordo com a legislação brasileira, você possui direitos sobre seus dados, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Confirmar a existência de tratamento de dados.</li>
                <li>Acessar seus dados pessoais.</li>
                <li>Corrigir dados incompletos ou inexatos.</li>
                <li>Solicitar a exclusão de dados desnecessários (observadas as obrigações legais de retenção).</li>
              </ul>
            </section>

            <div className="bg-muted p-6 rounded-xl border mt-8">
              <h2 className="text-lg font-bold text-foreground mb-2">Dúvidas ou Contato?</h2>
              <p className="text-muted-foreground">
                Se você tiver qualquer dúvida sobre esta política ou como tratamos seus dados, entre em contato com nossa equipe de suporte através dos canais oficiais da empresa.
              </p>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-12 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Dogão do Pastor. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
