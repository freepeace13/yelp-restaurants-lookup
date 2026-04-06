type SearchStatusMessageProps = {
  loading: boolean;
  error: string | null;
  searched: boolean;
  resultCount: number;
};

export function SearchStatusMessage({
  loading,
  error,
  searched,
  resultCount,
}: SearchStatusMessageProps) {
  if (loading || error) return null;

  if (!searched && resultCount === 0) {
    return (
      <p className="mt-8 text-center text-sm text-slate-500">
        Submit a city to see restaurants.
      </p>
    );
  }

  if (searched && resultCount === 0) {
    return (
      <p className="mt-8 text-center text-sm text-slate-500">
        No restaurants returned for that search.
      </p>
    );
  }

  return null;
}
