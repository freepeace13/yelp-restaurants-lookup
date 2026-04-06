type ErrorAlertProps = {
  message: string;
};

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <p
      className="mt-4 rounded-lg border border-red-900/80 bg-red-950/50 px-3 py-2 text-sm text-red-200"
      role="alert"
    >
      {message}
    </p>
  );
}
