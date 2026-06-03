import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    if (form.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl streak-fire">📖</span>
          <h1 className="font-display text-2xl font-bold text-ink-900 mt-3">Criar conta</h1>
          <p className="text-ink-500 font-body text-sm mt-1">Comece a sua jornada de hábitos hoje</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Nome completo</label>
              <input name="name" value={form.name} onChange={handle}
                className="input-field" placeholder="O seu nome" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input-field" placeholder="o-seu@email.com" required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="input-field" placeholder="Mínimo 6 caracteres" required />
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength
                        ? strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-amber-400' : 'bg-sage-500'
                        : 'bg-ink-200'
                    }`} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirmar senha</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handle}
                className="input-field" placeholder="Repita a senha" required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2">
              {loading ? <><span className="animate-spin">⏳</span> A criar...</> : <><span>✨</span> Criar conta</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-100 text-center">
            <p className="text-sm text-ink-500 font-body">
              Já tem conta?{' '}
              <Link to="/login" className="text-sage-600 font-semibold hover:text-sage-500 transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
