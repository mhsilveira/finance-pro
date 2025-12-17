type Transaction = {
	id: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	date: string;
};

export function TransactionCard({ t }: { t: Transaction }) {
	const color = t.type === "income" ? "green" : "red";
	const sign = t.type === "income" ? "+" : "-";

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				padding: "8px 0",
				borderBottom: "1px solid #eee",
			}}
		>
			<div>
				<strong>{t.description}</strong>
				<div style={{ fontSize: 12, color: "#666" }}>{t.date}</div>
			</div>
			<div style={{ color }}>
				{sign} R$ {t.amount.toFixed(2)}
			</div>
		</div>
	);
}
