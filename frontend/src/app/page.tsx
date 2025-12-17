// src/app/page.tsx
"use client";
import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen bg-slate-950">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* Hero Section */}
				<div className="text-center mb-16 pt-12">
					<div className="mb-6 flex justify-center">
						<div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
							<span className="text-4xl">💰</span>
						</div>
					</div>
					<h1 className="text-6xl font-bold mb-4 text-gray-100">Finance Pro</h1>
					<p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
						Controle completo das suas finanças pessoais. Gerencie transações, analise gastos e alcance suas metas
						financeiras.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/dashboard"
							className="px-8 py-4 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-semibold text-lg shadow-lg shadow-yellow-500/20"
						>
							Acessar Dashboard
						</Link>
						<Link
							href="/transactions"
							className="px-8 py-4 bg-slate-900 text-gray-100 border border-slate-800 rounded-lg hover:border-slate-700 hover:bg-slate-800 transition-all font-semibold text-lg"
						>
							Ver Transações
						</Link>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					<div className="bg-slate-900 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-all">
						<div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
							<span className="text-3xl">📊</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-100 mb-2">Dashboard</h3>
						<p className="text-gray-400">
							Visualize suas finanças com gráficos interativos e estatísticas em tempo real.
						</p>
					</div>

					<div className="bg-slate-900 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-all">
						<div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
							<span className="text-3xl">💳</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-100 mb-2">Transações</h3>
						<p className="text-gray-400">Registre e gerencie todas as suas receitas e despesas de forma simples.</p>
					</div>

					<div className="bg-slate-900 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-all">
						<div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
							<span className="text-3xl">📈</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-100 mb-2">Análises</h3>
						<p className="text-gray-400">Identifique padrões de gastos e descubra oportunidades de economia.</p>
					</div>

					<div className="bg-slate-900 border border-slate-800 rounded-lg p-8 hover:border-slate-700 transition-all">
						<div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
							<span className="text-3xl">🎯</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-100 mb-2">Orçamentos</h3>
						<p className="text-gray-400">Defina metas e orçamentos para manter suas finanças sob controle.</p>
					</div>
				</div>

				{/* Stats Section */}
				<div className="bg-slate-900 border border-slate-800 rounded-lg p-12">
					<h2 className="text-3xl font-bold text-center mb-8 text-gray-100 uppercase tracking-wide">
						Recursos Poderosos
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="text-4xl font-bold text-yellow-400 mb-2 tabular-nums">100%</div>
							<p className="text-gray-400">Controle Total</p>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-yellow-400 mb-2">Múltiplas</div>
							<p className="text-gray-400">Categorias</p>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-yellow-400 mb-2">Ilimitado</div>
							<p className="text-gray-400">Transações</p>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="text-center mt-16">
					<h2 className="text-3xl font-bold text-gray-100 mb-4">Pronto para começar?</h2>
					<p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
						Comece a gerenciar suas finanças de forma inteligente e alcance seus objetivos financeiros.
					</p>
					<Link
						href="/dashboard"
						className="inline-block px-10 py-5 bg-yellow-500 text-slate-950 rounded-lg hover:bg-yellow-400 transition-all font-bold text-xl shadow-lg shadow-yellow-500/20"
					>
						Começar Agora →
					</Link>
				</div>
			</div>
		</main>
	);
}
