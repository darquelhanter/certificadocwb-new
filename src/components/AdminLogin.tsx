import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (password: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/leads/list', {
        headers: { 'x-admin-password': password },
      });

      if (response.status === 401) {
        setError('Senha incorreta.');
        return;
      }

      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      onSuccess(password);
    } catch (err) {
      setError('Falha ao conectar com o servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 mt-12">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-800">Painel de Leads</h2>
        <p className="text-xs text-slate-400">Acesso restrito. Informe a senha de administrador.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          required
          autoFocus
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2.5 text-sm"
        />

        {error && (
          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{submitting ? 'Verificando...' : 'Entrar'}</span>
        </button>
      </form>
    </div>
  );
};
