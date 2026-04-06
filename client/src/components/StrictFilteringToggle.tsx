type StrictFilteringToggleProps = {
  strictFiltering: boolean;
  onStrictFilteringChange: (value: boolean) => void;
};

export function StrictFilteringToggle({
  strictFiltering,
  onStrictFilteringChange,
}: StrictFilteringToggleProps) {
  return (
    <label className="flex cursor-pointer border border-slate-700/80 px-3 py-2.5 select-none rounded-lg items-center gap-2.5 text-sm text-slate-200 mt-2 w-full mb-6">
      <div className=" flex flex-row gap-1">
        <input
          type="checkbox"
          checked={strictFiltering}
          onChange={(e) => onStrictFilteringChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-0 mt-[2px]"
        />
        <div className="flex flex-col ml-2">
          <span>Strict Filtering</span>
          <p className="text-xs text-slate-500">
            Hide listings outside the search radius (Haversine vs. city center).
          </p>
        </div>
      </div>
    </label>

  );
}
