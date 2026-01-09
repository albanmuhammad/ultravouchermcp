import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/_components/lib/supabase/server";
import { LoginForm } from "./LoginForm";

type PageProps = {
    searchParams?: Readonly<{
        redirect?: string;
    }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
    const supabase = await createSupabaseServerClient();
    const params = await searchParams;
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Kalau sudah login, jangan tampilkan login page lagi
    if (user) {
        redirect(params?.redirect ?? "/");
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <LoginForm redirectTo={params?.redirect ?? "/"} />
        </main>
    );
}
