import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}