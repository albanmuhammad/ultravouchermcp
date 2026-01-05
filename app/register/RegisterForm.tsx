"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";

type FormState = {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
};

export function RegisterForm() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>({
        email: "",
        password: "",
        phone: "",
        firstName: "",
        lastName: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function onChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await registerAction(form);

        if (!res.ok) {
            setError(res.message);
            setLoading(false);
            return;
        }

        // sukses → redirect
        router.push("/");
        router.refresh();
    }

    return (
        <form onSubmit={onSubmit}>
            <div style={{ display: "grid", gap: 16 }}>
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    required
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                    required
                />

                <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="08xxxxxxxx"
                    required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Input
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={onChange}
                        required
                    />

                    <Input
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={onChange}
                        required
                    />
                </div>

                {error && (
                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            padding: "10px 12px",
                            borderRadius: 8,
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: 8,
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 16px",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </div>
        </form>
    );
}

/* ---------- Small Input Component ---------- */

function Input(props: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
                {props.label}
            </span>
            <input
                name={props.name}
                type={props.type ?? "text"}
                value={props.value}
                onChange={props.onChange}
                placeholder={props.placeholder}
                required={props.required}
                style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                }}
            />
        </label>
    );
}
