// src/actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // Importar cookies aqui!
import { redirect } from "next/navigation";

interface ActionState {
  success: boolean;
  message?: string;
}

export async function loginAction(
  initialState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, message: "Por favor, preencha todos os campos." };
  }

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Email ou senha incorretos.",
      };
    }
    
    // Autenticação bem-sucedida
    // === AGORA DEFINIMOS O COOKIE DIRETAMENTE DA SERVER ACTION ===
    const cookieStore = await cookies();
    cookieStore.set("smf00", JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Ou 'strict', dependendo da sua necessidade
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });
    
  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, message: "Ocorreu um erro inesperado." };
  }

  // Redirecionamento após o sucesso da autenticação e da definição do cookie
  revalidatePath("/");
  redirect("/");
}
