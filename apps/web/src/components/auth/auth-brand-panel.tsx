'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function AuthBrandPanel() {
  return (
    <div className="relative flex h-full min-h-[420px] overflow-hidden rounded-[34px] bg-[#1EA8E7] text-white shadow-[0_25px_80px_rgba(7,112,168,0.22)]">
      <div className="absolute -left-14 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/8" />
      <div className="absolute right-[-2rem] top-[-1.5rem] h-32 w-32 rounded-full bg-white/14" />
      <div className="absolute bottom-10 left-6 h-24 w-24 rounded-full bg-white/6" />
      <div className="absolute right-14 top-16 h-16 w-16 rounded-full bg-white/7" />

      <div className="relative z-10 flex w-full flex-col justify-between px-6 py-7 md:px-8 md:py-8 lg:px-8 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-4"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm overflow-hidden">
            <Image src="/images/logo.png" alt="ServiLocal Logo" fill className="object-cover p-1" priority />
          </div>
          <span className="text-[1.95rem] font-extrabold tracking-[-0.03em]">
            ServiLocal
          </span>
        </motion.div>

        <div className="max-w-[500px] pt-8 lg:pt-10">
          <motion.h1
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.48 }}
            className="max-w-[500px] text-[3.3rem] font-extrabold leading-[0.95] tracking-[-0.05em] md:text-[3.7rem] xl:text-[4rem]"
          >
            Conectamos Talara con servicios de confianza
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16, duration: 0.48 }}
            className="mt-6 max-w-[470px] text-[1rem] leading-8 text-white/90"
          >
            Encuentra electricistas, soldadores, albañiles, pintores y más. Todo verificado y
            cerca de ti.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.48 }}
          className="mt-10 grid grid-cols-3 gap-4"
        >
          <StatCard value="1,000+" label="Usuarios activos" />
          <StatCard value="50+" label="Proveedores" />
          <StatCard value="4.8" label="Satisfacción Promedio" />
        </motion.div>

        <p className="mt-10 text-[0.95rem] text-white/78">
          © 2026 ServiLocal. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] bg-white/12 px-5 py-4 backdrop-blur-sm">
      <div className="text-[2.7rem] font-extrabold leading-none tracking-[-0.04em]">
        {value}
      </div>
      <div className="mt-2 text-[0.95rem] text-white/80">{label}</div>
    </div>
  );
}