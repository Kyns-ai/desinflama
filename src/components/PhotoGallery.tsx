"use client";

import { useEffect, useState } from "react";
import { Camera, Lock, Plus, Trash2 } from "lucide-react";
import { blobStore } from "@/data/storage";
import { useAppStore } from "@/store/useAppStore";
import { takePhoto } from "@/lib/camera";
import type { Photo } from "@/types/domain";

export function PhotoGallery() {
  const photos = useAppStore((s) => s.data.photos);
  const addPhoto = useAppStore((s) => s.addPhoto);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    const dataUrl = await takePhoto();
    if (dataUrl) await addPhoto(dataUrl);
    setBusy(false);
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          Fotos de progresso
        </h2>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint">
          <Lock className="size-3" /> só você vê
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={add}
          disabled={busy}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-cream-deep/40 text-ink-faint transition-colors active:bg-cream-deep disabled:opacity-50"
        >
          {busy ? (
            <Camera className="size-6 animate-pulse" />
          ) : (
            <Plus className="size-6" />
          )}
          <span className="text-xs font-medium">Adicionar</span>
        </button>

        {[...photos]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((p) => (
            <PhotoThumb key={p.id} photo={p} />
          ))}
      </div>
    </section>
  );
}

function PhotoThumb({ photo }: { photo: Photo }) {
  const removePhoto = useAppStore((s) => s.removePhoto);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    blobStore.load(photo.ref).then((d) => active && setUrl(d));
    return () => {
      active = false;
    };
  }, [photo.ref]);

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-deep">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Progresso ${photo.date}`} className="size-full object-cover" />
      ) : (
        <div className="size-full [animation:var(--animate-shimmer)]" />
      )}
      <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
        {formatShort(photo.date)}
      </span>
      <button
        onClick={() => removePhoto(photo.id)}
        aria-label="Remover foto"
        className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-opacity"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function formatShort(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}
