"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/app/_components/lib/supabase/client";
import { loginUvCustomer } from "../_components/lib/ultravoucher/ultravoucher-login";

type Props = {
    redirectTo: string;
};

export function LoginForm({ redirectTo }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createSupabaseBrowserClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    // Show message based on redirect reason and check if already logged in
    useEffect(() => {
        const reason = searchParams.get("reason");

        // Check if user is already logged in to Supabase
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && reason === "uv_token_required") {
                // User is logged in to Supabase, just need UV token
                // Pre-fill email from Supabase
                setEmail(user.email || "");
                setInfoMessage("Anda sudah login. Silakan masukkan nomor telepon UltraVoucher untuk melanjutkan.");
            } else if (reason === "session_expired") {
                setInfoMessage("Sesi Anda telah berakhir. Silakan login kembali.");
            } else if (reason === "uv_session_expired") {
                setInfoMessage("Sesi UltraVoucher Anda telah berakhir. Silakan login kembali.");
            } else if (reason === "login_required") {
                setInfoMessage("Silakan login untuk melanjutkan.");
            }
        });
    }, [searchParams, supabase.auth]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setInfoMessage(null);
        setLoading(true);

        try {
            // Check if user is already logged in to Supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Step 1: Login to Supabase if not logged in
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw new Error(authError.message);
            }

            // Step 2: Login to UltraVoucher to get access key (always required)
            try {
                await loginUvCustomer({
                    email,
                    phone,
                    countryCode: "62",
                });
            } catch (uvError) {
                throw new Error(
                    uvError instanceof Error
                        ? `UltraVoucher login failed: ${uvError.message}`
                        : "UltraVoucher login failed"
                );
            }

            // Step 3: Redirect on success
            router.replace(redirectTo);
            router.refresh(); // Force refresh to get new cookies
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

            {/* Info Message */}
            {infoMessage && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
                    {infoMessage}
                </div>
            )}

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
                        disabled={loading}
                    />
                </div>

                {/* Password - only show if user is not logged in to Supabase yet */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                        {email && " (kosongkan jika sudah login)"}
                    </label>
                    <input
                        type="password"
                        required={!email} // Only required if email is empty
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        disabled={loading}
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
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Nomor yang terdaftar di UltraVoucher (tanpa +62)
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