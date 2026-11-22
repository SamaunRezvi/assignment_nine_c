'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageValidationError, IMAGE_ACCEPT } from '@/lib/image-validation';

export function ImageUpload({
  id, label, value, onChange, currentImage, alt, disabled, required, avatar = false,
}: {
  id: string;
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  currentImage?: string;
  alt: string;
  disabled?: boolean;
  required?: boolean;
  avatar?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<{ file: File; url: string }>();
  const preview = value && selection?.file === value ? selection.url : currentImage;

  useEffect(() => {
    return () => {
      if (selection) URL.revokeObjectURL(selection.url);
    };
  }, [selection]);

  useEffect(() => {
    if (!value && inputRef.current) inputRef.current.value = '';
  }, [value]);

  return (
    <div className={avatar ? 'flex items-center gap-4' : 'space-y-3'}>
      {avatar ? (
        <Avatar className="h-16 w-16">
          <AvatarImage src={preview} alt={alt} />
          <AvatarFallback>{alt.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : preview ? (
        <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted">
          <Image src={preview} alt={alt} fill unoptimized className="object-contain" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          ref={inputRef}
          id={id}
          type="file"
          accept={IMAGE_ACCEPT}
          disabled={disabled}
          required={required}
          aria-describedby={`${id}-help`}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            const error = file ? getImageValidationError(file) : null;
            if (error) {
              event.target.value = '';
              setSelection(undefined);
              onChange(null);
              toast.error(error);
              return;
            }
            setSelection(file ? { file, url: URL.createObjectURL(file) } : undefined);
            onChange(file);
          }}
        />
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          JPG, PNG, WebP, or GIF, up to 10 MB. Preview your photo here, then save to upload it.
        </p>
      </div>
    </div>
  );
}
