import type { RestaurantJson } from "../types/restaurant";

type RestaurantCardProps = {
  restaurant: RestaurantJson;
};

export function RestaurantCard({ restaurant: r }: RestaurantCardProps) {
  return (
    <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 text-base font-medium text-white">
          {r.name}
          {r.locationRelevance?.assessed &&
            r.locationRelevance.withinFiveMiles === false && (
              <span
                className="ml-2 inline-block rounded border border-amber-700/80 bg-amber-950/80 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-200"
                title={`About ${r.locationRelevance.distanceMiles ?? "?"} mi from geocoded city center (outside 5 mi)`}
              >
                Outside 5 mi
              </span>
            )}
        </h2>
        <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-sm font-medium text-amber-300">
          {r.rating.formats.display}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-400">{r.address.formats.display}</p>
      <p className="mt-1 font-mono text-xs text-slate-500">
        {r.coordinates.formats.display}
      </p>
    </li>
  );
}
