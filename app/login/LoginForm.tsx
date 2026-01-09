"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/app/_components/lib/supabase/client";
import { loginUvCustomer } from "../_components/lib/ultravoucher/ultravoucher-login";

type Props = {
    redirectTo: string;
};

export function LoginForm({ redirectTo }: Props) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw new Error(authError.message);

            await loginUvCustomer({
                email,
                phone,
                countryCode: "62",
            });

            router.replace(redirectTo);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900">
                    Login
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Masuk untuk melihat dan menukar voucher
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="email@example.com"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (UltraVoucher)
                    </label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="812xxxxxx"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Digunakan untuk login ke UltraVoucher
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 rounded-lg bg-blue-600 text-white py-2.5 font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
                Belum punya akun?{" "}
                <a href="/register" className="text-blue-600 font-medium hover:underline">
                    Register
                </a>
            </div>
        </div>
    );
}
