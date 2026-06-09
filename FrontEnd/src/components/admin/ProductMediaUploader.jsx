import { ImagePlus, Play, UploadCloud, Video, X } from "lucide-react";
import { useId, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { formatDecimal, formatNumber } from "../../utils/format.js";
import {
  getMediaSource,
  isFileMediaSource,
} from "../../utils/media.js";
import ProductVisual from "../ProductVisual.jsx";

function formatFileSize(size) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${formatNumber(Math.ceil(size / 1024))} KB`;
  return `${formatDecimal(size / (1024 * 1024), 1)} MB`;
}

function UploadBox({ accept, children, id, multiple, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-petal bg-white px-5 py-6 text-center transition hover:border-clay hover:bg-shell/50"
    >
      {children}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

function ImagePreview({ image, onRemove }) {
  const { t } = useLanguage();
  const source = getMediaSource(image);

  return (
    <article className="overflow-hidden rounded-2xl border border-petal/70 bg-white p-2 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-white via-ivory to-shell">
        {isFileMediaSource(source) ? (
          <img src={source} alt="" className="h-full w-full object-cover" />
        ) : (
          <ProductVisual product={{ id: image.id, image: source }} className="h-full w-full rounded-xl" />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-terracotta shadow-sm transition hover:bg-shell"
          aria-label={t("remove")}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 truncate text-xs font-bold text-ink">{image.name}</p>
      {image.size ? (
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {formatFileSize(image.size)}
        </p>
      ) : null}
    </article>
  );
}

export default function ProductMediaUploader({
  error = "",
  images,
  onImagesChange,
  onVideoChange,
  video,
}) {
  const { t } = useLanguage();
  const imageInputId = useId();
  const videoInputId = useId();
  const [busy, setBusy] = useState(false);
  const videoSource = getMediaSource(video);

  const handleImages = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setBusy(true);
    const nextImages = files.map((file, index) => ({
      id: `image-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    onImagesChange([...images, ...nextImages]);
    setBusy(false);
  };

  const handleVideo = async (event) => {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    onVideoChange({
      id: `video-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setBusy(false);
  };

  return (
    <section className="md:col-span-2">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-sm font-extrabold text-ink">{t("uploadProductImages")}</p>
          <UploadBox
            id={imageInputId}
            accept="image/*"
            multiple
            onChange={handleImages}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-shell text-terracotta ring-1 ring-petal/70">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-extrabold text-ink">
              {t("chooseImages")}
            </span>
            <span className="mt-1 text-xs font-semibold text-muted">
              {t("acceptedImageFormats")}
            </span>
          </UploadBox>
          {error ? (
            <p className="mt-2 text-xs font-bold text-sale">{error}</p>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-extrabold text-ink">{t("uploadProductVideo")}</p>
          <UploadBox
            id={videoInputId}
            accept="video/*"
            onChange={handleVideo}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-shell text-terracotta ring-1 ring-petal/70">
              <Video className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-extrabold text-ink">
              {video ? t("replaceVideo") : t("chooseVideo")}
            </span>
            <span className="mt-1 text-xs font-semibold text-muted">
              {t("acceptedVideoFormats")}
            </span>
          </UploadBox>
        </div>
      </div>

      {busy ? (
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-muted">
          <UploadCloud className="h-4 w-4 text-terracotta" aria-hidden="true" />
          {t("preview")}
        </p>
      ) : null}

      {images.length ? (
        <div className="mt-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
            {t("images")}
          </p>
          <div className="mt-3 grid gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <ImagePreview
                key={image.id}
                image={image}
                onRemove={() =>
                  onImagesChange(images.filter((_, imageIndex) => imageIndex !== index))
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {video && videoSource ? (
        <div className="mt-5 rounded-2xl border border-petal/70 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                {t("video")}
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{video.name}</p>
              {video.size ? (
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {formatFileSize(video.size)}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onVideoChange(null)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-petal bg-white px-3 text-xs font-extrabold text-terracotta transition hover:bg-shell"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {t("remove")}
            </button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl bg-charcoal">
            <video
              src={videoSource}
              controls
              className="aspect-video w-full object-cover"
            />
            <div className="flex items-center gap-2 border-t border-white/10 bg-charcoal px-3 py-2 text-xs font-bold text-white">
              <Play className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
              {t("preview")}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
