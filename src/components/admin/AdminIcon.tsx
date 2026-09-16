/**
 * Ikon Material Symbols untuk seluruh halaman admin.
 * Pastikan font dimuat di __root.tsx (Material Symbols Outlined).
 */
export function AdminIcon({
  name,
  className = "text-[20px]",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`adm-icon ${className}`}>
      {name}
    </span>
  );
}
