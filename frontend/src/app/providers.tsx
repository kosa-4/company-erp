"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

export default function providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
        </AuthProvider>
    );
}
