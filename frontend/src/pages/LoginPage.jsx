// ──────────────────────────────────────────────────────────────────────────────
//  Pagina de Login
//  Passo a passo:
//    1. Renderiza formulario com email e password
//    2. No submit, chama a funcao login() do AuthContext
//    3. Se sucesso, redireciona para o dashboard
//    4. Se erro, mostra mensagem de erro ao utilizador
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  // Hook de autenticacao (login, register, logout, user, loading)
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estado local do formulario
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Atualiza o campo do formulario quando o utilizador escreve
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Submeter o formulario de login
  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Passo 1: chamar a API de login (AuthContext trata do localStorage)
      await login(form.email, form.password);

      // Passo 2: redirecionar para o dashboard
      navigate('/dashboard');
    } catch (err) {
      // Passo 3: mostrar erro (credenciais invalidas, servidor offline, etc.)
      setError(err.response?.data?.error || 'Erro ao entrar. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo: apresentacao (visivel apenas em ecra grande) */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.05) 40px, rgba(255,255,255,.05) 41px)' }} />
        <div>
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">📖</span>
            <h1 className="font-display text-2xl text-white font-bold">Diário de Hábitos</h1>
          </div>
          <blockquote className="text-ink-200 font-display text-3xl leading-relaxed font-semibold">
            &ldquo;Somos o que fazemos repetidamente. A excel&ecirc;ncia n&atilde;o &eacute; um acto, mas um h&aacute;bito.&rdquo;
          </blockquote>
          <p className="mt-4 text-ink-400 font-body">&mdash; Arist&oacute;teles</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            ['🌅','Consist&ecirc;ncia','Constru&iacute;da dia a dia'],
            ['🔥','Motiva&ccedil;&atilde;o','Acompanhe as suas sequ&ecirc;ncias'],
            ['📊','Progresso','Visualize a sua evolu&ccedil;&atilde;o']
          ].map(([icon, title, sub]) => (
            <div key={title} className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-white text-sm font-semibold">{title}</p>
              <p className="text-ink-400 text-xs mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito: formulario de login */}
      <div className="flex-1 flex items-center justify-center p-6 bg-ink-50 dark:bg-ink-950">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo (visivel apenas em ecra pequeno) */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl streak-fire">📖</span>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mt-2">Diário de Hábitos</h1>
          </div>

          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mb-2">Bem-vindo de volta</h2>
            <p className="text-ink-500 dark:text-ink-400 font-body text-sm mb-8">Entre na sua conta para continuar</p>

            {/* Mensagem de erro, se houver */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 text-sm font-body">
                ⚠️ {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle}
                  className="input-field" placeholder="o-seu@email.com" required />
              </div>
              <div>
                <label className="label">Senha</label>
                <input name="password" type="password" value={form.password} onChange={handle}
                  className="input-field" placeholder="••••••••" required />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2">
                {loading ? (
                  <><span className="animate-spin">⏳</span> A entrar...</>
                ) : (
                  <><span>🚀</span> Entrar</>
                )}
              </button>
            </form>

            {/* Link para registo */}
            <div className="mt-6 pt-6 border-t border-ink-100 dark:border-ink-800 text-center">
              <p className="text-sm text-ink-500 dark:text-ink-400 font-body">
                N&atilde;o tem conta?{' '}
                <Link to="/register" className="text-sage-600 dark:text-sage-400 font-semibold hover:text-sage-500 dark:hover:text-sage-300 transition-colors">
                  Criar conta gratuita
                </Link>
              </p>
            </div>

            {/* Credenciais de administrador para teste */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400 font-mono">
              🔑 Admin demo: admin@habitdiary.com / Admin@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
