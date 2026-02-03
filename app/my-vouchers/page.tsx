import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/_components/lib/supabase/server";
import { getMyVouchers } from "@/app/_components/lib/ultravoucher/get-my-vouchers";

export default async function MyVouchersPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirect=/my-vouchers");
    }

    const result = await getMyVouchers();
    const vouchers = result.data.docs;

    return (
        <main className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-8">
                    🎟️ My Vouchers
                </h1>

                {vouchers.length === 0 ? (
                    <p className="text-gray-500">Belum ada voucher</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {vouchers.map((v) => (
                            <div
                                key={v.id}
                                className="bg-white rounded-2xl shadow p-4"
                            >
                                <img
                                    src={v.imageUrl}
                                    alt={v.name}
                                    className="rounded-xl mb-4"
                                />

                                <h3 className="font-bold text-lg">{v.name}</h3>

                                <p className="text-sm text-gray-500">
                                    Nominal: Rp {v.nominal.toLocaleString("id-ID")}
                                </p>

                                <p className="text-sm text-gray-500">
                                    Expired: {new Date(v.expiredAt).toLocaleDateString("id-ID")}
                                </p>

                                <a
                                    href={Buffer.from(v.url, "base64").toString("utf-8")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold"
                                >
                                    Gunakan Voucher
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
