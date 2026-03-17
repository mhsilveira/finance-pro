"use client";

import { useState } from "react";
import { Sparkles, TrendingDown, Lightbulb, AlertTriangle, Loader2 } from "lucide-react";
import { getSpendingInsights, type SpendingInsight } from "@/services/api";

interface SpendingInsightsProps {
	userId: string;
	currentMonth: string;
}

export function SpendingInsights({ userId, currentMonth }: SpendingInsightsProps) {
	const [insights, setInsights] = useState<SpendingInsight | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGenerate = async () => {
		setLoading(true);
		setError(null);

		try {
			const data = await getSpendingInsights(userId, currentMonth);
			setInsights(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao gerar insights");
		} finally {
			setLoading(false);
		}
	};

	if (!insights && !loading && !error) {
		return (
			<div className="glass rounded-2xl p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-purple-400" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-[var(--text-primary)]">Insights com IA</h3>
							<p className="text-sm text-[var(--text-secondary)]">Análise inteligente dos seus gastos</p>
						</div>
					</div>
					<button
						onClick={handleGenerate}
						className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white rounded-xl text-sm font-medium transition-colors shadow-[0_0_20px_var(--accent-glow)]"
					>
						Gerar Insights
					</button>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="glass rounded-2xl p-8">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
					<p className="text-[var(--text-secondary)] text-sm">Analisando seus gastos com IA...</p>
					<p className="text-[var(--text-muted)] text-xs">Isso pode levar alguns segundos</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="glass border border-pink-500/30 rounded-2xl p-6">
				<div className="flex items-start gap-3">
					<AlertTriangle className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
					<div className="flex-1">
						<p className="text-pink-400 text-sm">{error}</p>
						<button
							onClick={handleGenerate}
							className="mt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
						>
							Tentar novamente
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="glass rounded-2xl p-6 space-y-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
						<Sparkles className="w-5 h-5 text-purple-400" />
					</div>
					<h3 className="text-lg font-semibold text-[var(--text-primary)]">Insights com IA</h3>
				</div>
				<button
					onClick={handleGenerate}
					className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
				>
					Atualizar
				</button>
			</div>

			<p className="text-[var(--text-secondary)] text-sm leading-relaxed">{insights!.summary}</p>

			{insights!.highlights.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<TrendingDown className="w-4 h-4 text-amber-400" />
						<span className="text-sm font-medium text-[var(--text-primary)]">Destaques</span>
					</div>
					<ul className="space-y-1.5">
						{insights!.highlights.map((h, i) => (
							<li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
								<span className="text-amber-500 mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
								{h}
							</li>
						))}
					</ul>
				</div>
			)}

			{insights!.recommendations.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<Lightbulb className="w-4 h-4 text-emerald-400" />
						<span className="text-sm font-medium text-[var(--text-primary)]">Recomendações</span>
					</div>
					<ul className="space-y-1.5">
						{insights!.recommendations.map((r, i) => (
							<li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
								<span className="text-emerald-500 mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
								{r}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
