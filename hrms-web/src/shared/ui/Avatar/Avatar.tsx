type AvatarProps = {
  src?: string | null;
  alt: string;
  sizeClass?: string;
  className?: string;
};

export const avatarPlaceholder = "/hrms-assets/profile.png";

export function Avatar({
  src,
  alt,
  sizeClass = "h-9 w-9",
  className = "",
}: AvatarProps) {
  return (
    <img
      className={`${sizeClass} rounded-full object-cover ${className}`}
      src={src || avatarPlaceholder}
      alt={alt}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = avatarPlaceholder;
      }}
    />
  );
}
