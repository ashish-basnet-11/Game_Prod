"use client";

import SpinWheelAdmin from "@/components/admin/SpinWheelAdmin";

export default function AdminSpinWheelPage() {
    return (
        <div className="p-6 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display font-black text-2xl text-white tracking-wide">Spin Wheel Management</h1>
                    <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Configure rewards and view recent spin activity
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <SpinWheelAdmin />
            </div>
        </div>
    );
}
