export default function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</span>
      )}
      <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
    </div>
  );
}
