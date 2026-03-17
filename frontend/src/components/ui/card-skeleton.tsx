import { Skeleton } from "./skeleton";

export function StatsCardSkeleton() {
	return (
		<div className="glass p-6">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Skeleton className="h-4 w-20 mb-3" />
					<Skeleton className="h-8 w-24 mb-2" />
					<Skeleton className="h-3 w-16" />
				</div>
				<Skeleton className="h-12 w-12 rounded-lg" />
			</div>
		</div>
	);
}

export function ChartCardSkeleton() {
	return (
		<div className="glass p-6">
			<Skeleton className="h-6 w-40 mb-6" />
			<div className="space-y-4">
				<Skeleton className="h-64 w-full" />
			</div>
		</div>
	);
}
