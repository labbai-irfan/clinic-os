/**
 * Avatar — a patient/user image with an initials fallback.
 *
 * Renders an `<img>` when `src` is provided and loads successfully; otherwise it
 * shows `initials` (or, if none given, nothing visible but still labelled). The
 * `alt` text is REQUIRED — it is the accessible name for the image and the
 * accessible label for the fallback (Frontend-Bible §6.2: every avatar image
 * gets a localised alt).
 *
 * Sizes sm/md/lg map to size-8 / size-10 / size-12.
 *
 * Governed by: Phase 6 design-system spec (AGENT C — Avatar).
 */
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes, useState } from 'react';

import { cn } from '@shared/lib/cn';

const avatar = cva(
  [
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    'bg-surface-sunken text-text-muted font-semibold uppercase select-none',
  ],
  {
    variants: {
      size: {
        sm: 'size-8 text-body-sm',
        md: 'size-10 text-body-md',
        lg: 'size-12 text-body-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>, VariantProps<typeof avatar> {
  /** Image source. When omitted or failed, the initials fallback is shown. */
  src?: string;
  /** REQUIRED accessible name for the avatar (e.g. the person's full name). */
  alt: string;
  /** Initials shown when no image is available (e.g. "AK"). */
  initials?: string;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size, src, alt, initials, ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      ref={ref}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : alt}
      className={cn(avatar({ size }), className)}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
});
Avatar.displayName = 'Avatar';
