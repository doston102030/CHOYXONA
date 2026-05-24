"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.loginAdmin);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      toast.success("Xush kelibsiz, admin");
      router.push("/admin");
    } else {
      toast.error("Login yoki parol xato");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-[#64748B] hover:text-[#94A3B8] mb-8 text-sm"
        >
          ← Bosh sahifaga
        </Link>

        <div className="bg-[#1A1F2B] border border-[#273244] rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B0F14] border border-[#273244] mb-3">
              <Lock size={22} className="text-[#94A3B8]" />
            </div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Admin panel</h1>
            <p className="text-sm text-[#64748B] mt-1">Tizimga kiring</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
              />
              <Input
                label="Login"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9"
                placeholder="Bobir2020"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none mt-3"
              />
              <Input
                label="Parol"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                placeholder="••••"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Kirish
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
