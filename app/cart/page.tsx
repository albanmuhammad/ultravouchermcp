import { createSupabaseServerClient } from "@/app/_components/lib/supabase/server";
import { redirect } from "next/navigation";
import { RemoveFromCartButton } from "./RemoveFromCartButton";

export default async function CartPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: items } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const total =
        items?.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
        ) ?? 0;

    return (
        <main className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
                <h1 className="text-2xl font-extrabold mb-6">🛒 Your Cart</h1>

                {!items || items.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty</p>
                ) : (
                    <>
                        <ul className="space-y-4">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex justify-between items-start border-b pb-4"
                                >
                                    <div>
                                        <p className="font-semibold">{item.voucher_name}</p>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity}
                                        </p>

                                        <RemoveFromCartButton
                                            cartItemId={item.id}
                                            voucherId={item.voucher_id}
                                            voucherName={item.voucher_name}
                                            price={item.price}
                                        />
                                    </div>

                                    <p className="font-bold">
                                        Rp {Number(item.price).toLocaleString("id-ID")}
                                    </p>
                                </li>
                            ))}
                        </ul>


                        <div className="mt-6 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>Rp {total.toLocaleString("id-ID")}</span>
                        </div>

                        {/* Placeholder redeem button */}
                        <button
                            disabled
                            className="mt-6 w-full bg-gray-300 text-gray-600 py-3 rounded-xl cursor-not-allowed"
                        >
                            Redeem (coming next)
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}
