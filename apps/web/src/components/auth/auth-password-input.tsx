'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { AuthInput } from './auth-input';

type AuthPasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
};

export function AuthPasswordInput({
  value,
  onChange,
  placeholder = '********',
  name,
  id,
  autoComplete,
}: AuthPasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <AuthInput
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        icon={<Lock className="h-5 w-5" />}
        className="pr-14"
        autoComplete={autoComplete}
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:text-[var(--sl-primary)]"
        style={{ color: 'var(--sl-text-muted)' }}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}