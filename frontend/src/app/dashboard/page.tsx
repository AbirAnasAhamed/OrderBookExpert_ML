import { StatsCards } from "@/components/features/dashboard/StatsCards"
import { PerformanceChart } from "@/components/features/dashboard/PerformanceChart"
import { SystemStatus } from "@/components/features/dashboard/SystemStatus"

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Real-time performance and system metrics.
        </p>
      </div>
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PerformanceChart />
        <SystemStatus />
      </div>
    </div>
  )
}
