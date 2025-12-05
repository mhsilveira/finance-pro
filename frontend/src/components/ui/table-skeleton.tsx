import { Skeleton } from "./skeleton"

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-4 text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-6 py-4 text-center">
                <Skeleton className="h-4 w-16 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-20 rounded" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-16 rounded" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-6 py-4 text-right">
                  <Skeleton className="h-5 w-24 ml-auto" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-6 py-4 text-center">
                  <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
