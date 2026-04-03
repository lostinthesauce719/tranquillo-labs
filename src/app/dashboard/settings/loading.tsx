import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Settings tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border pb-px">
        {["General", "Team", "Notifications", "Integrations"].map((tab) => (
          <Skeleton key={tab} className="h-9 w-28 rounded-t-lg" />
        ))}
      </div>

      {/* Settings sections */}
      <div className="space-y-6 max-w-2xl">
        {/* Section 1 */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-36 mb-2" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
