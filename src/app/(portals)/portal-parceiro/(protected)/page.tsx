import { redirect } from "next/navigation";

export default async function DashboardPage() {
  redirect('/portal-parceiro/doacoes');
}