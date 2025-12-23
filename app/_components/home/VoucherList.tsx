import type { Voucher } from "@/app/page";
import { VoucherCard } from "./VoucherCard";

type VoucherListProps = {
    vouchers: ReadonlyArray<Voucher>;
};

export function VoucherList({ vouchers }: VoucherListProps) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24
        }}>
            {vouchers.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} />
            ))}
        </div>
    );
}