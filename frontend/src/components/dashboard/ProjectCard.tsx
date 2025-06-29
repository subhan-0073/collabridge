export type ProjectCardProps = {
  _id: string;
  name: string;
  description?: string;
  teamName: string;
  status?: string;
  memberCount: number;
  onClick?: () => void;
};

export default function ProjectCard({
  name,
  description,
  teamName,
  memberCount,
  onClick,
}: ProjectCardProps) {
  return (
    <div
      className=" rounded-xl border bg-card p-4 shadow hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{name}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
          {description}
        </p>
      )}

      <div className="mt-3 text-sm text-muted-foreground flex justify-between">
        <span>👥{memberCount}</span>
        <span>🏷️{teamName}</span>
      </div>
    </div>
  );
}
