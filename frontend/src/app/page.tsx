// src/app/page.tsx
"use client";
import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* Hero Section */}
				<div className="text-center mb-16 pt-12">
					<div className="mb-6 flex justify-center">
						<div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
							<span className="text-4xl">💰</span>
						</div>
					</div>
					<h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
						Finance Pro
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
						Controle completo das suas finanças pessoais. Gerencie transações,
						analise gastos e alcance suas metas financeiras.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/dashboard"
							className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all font-semibold text-lg"
						>
							Acessar Dashboard
						</Link>
						<Link
							href="/transactions"
							className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:shadow-xl transition-all font-semibold text-lg border-2 border-gray-200"
						>
							Ver Transações
						</Link>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100">
						<div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
							<span className="text-3xl">📊</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Dashboard
						</h3>
						<p className="text-gray-600">
							Visualize suas finanças com gráficos interativos e estatísticas
							em tempo real.
						</p>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100">
						<div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
							<span className="text-3xl">💳</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Transações
						</h3>
						<p className="text-gray-600">
							Registre e gerencie todas as suas receitas e despesas de forma
							simples.
						</p>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100">
						<div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
							<span className="text-3xl">📈</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Análises
						</h3>
						<p className="text-gray-600">
							Identifique padrões de gastos e descubra oportunidades de
							economia.
						</p>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100">
						<div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
							<span className="text-3xl">🎯</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Orçamentos
						</h3>
						<p className="text-gray-600">
							Defina metas e orçamentos para manter suas finanças sob controle.
						</p>
					</div>
				</div>

				{/* Stats Section */}
				<div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl p-12 border border-gray-100">
					<h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Recursos Poderosos
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
								100%
							</div>
							<p className="text-gray-600">Controle Total</p>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
								Múltiplas
							</div>
							<p className="text-gray-600">Categorias</p>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
								Ilimitado
							</div>
							<p className="text-gray-600">Transações</p>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="text-center mt-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Pronto para começar?
					</h2>
					<p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
						Comece a gerenciar suas finanças de forma inteligente e alcance seus
						objetivos financeiros.
					</p>
					<Link
						href="/dashboard"
						className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all font-bold text-xl"
					>
						Começar Agora →
					</Link>
				</div>
			</div>
		</main>
	);
}
