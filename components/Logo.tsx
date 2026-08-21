export default function Logo({
  className = "h-8 w-auto sm:h-9",
}: {
  className?: string;
}) {
  return (
    <a href="/" className="inline-flex items-center" aria-label="Nutraatoz home">
      <img
        src="/nutraatoz-wordmark.png"
        alt="Nutraatoz — complete nutritional vitality"
        className={className}
      />
    </a>
  );
}
