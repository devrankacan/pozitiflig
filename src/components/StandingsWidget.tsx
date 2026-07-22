"use client";

export default function StandingsWidget({
  id,
  title,
  src,
  sofascoreUrl,
  height,
}: {
  id: string;
  title: string;
  src: string;
  sofascoreUrl: string;
  height: number;
}) {
  return (
    <div className="pl-card overflow-hidden p-5">
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      <div className="w-full overflow-hidden rounded-lg bg-white">
        <iframe
          id={id}
          title={title}
          src={src}
          style={{ height, maxWidth: 768, width: "100%", border: 0 }}
          scrolling="no"
          loading="lazy"
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Sıralamalar{" "}
        <a
          href={sofascoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Sofascore
        </a>{" "}
        tarafından sağlanmıştır.
      </p>
    </div>
  );
}
