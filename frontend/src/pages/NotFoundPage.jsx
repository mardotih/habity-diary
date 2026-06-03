import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50 dark:bg-ink-950">
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-7xl mb-6">🔍</div>
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">404</h1>
        <p className="font-display text-xl text-ink-700 dark:text-ink-300 mb-2">Página não encontrada</p>
        <p className="text-ink-500 dark:text-ink-400 font-body text-sm mb-8">
          A página que procura não existe ou foi movida.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          📊 Ir para o dashboard
        </Link>
      </div>
    </div>
  );
}
