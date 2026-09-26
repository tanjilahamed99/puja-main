"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { compressImage } from "./compressImage";

const IMGBB_API_KEY = "cf3e237cff891fb67b34bc023a1a5413";

export async function uploadFileToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.data.url;
}

export default function UploadImage({
  value = "",
  onChange,
  label = "Image",
  required = false,
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      setError("");

      // Validate image
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }

      // 10MB raw file limit
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB.");
        return;
      }

      setUploading(true);

      try {
        // Compress before uploading
        const compressedFile = await compressImage(file);

        // Upload to ImgBB
        const url = await uploadFileToImgBB(compressedFile);

        onChange?.(url);
      } catch (err) {
        setError(err?.message || "Something went wrong while uploading.");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    // Allow selecting the same file again
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);
  };

  const removeImage = () => {
    onChange?.("");
    setError("");
  };

  const openFilePicker = () => {
    if (!uploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Preview */}
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-video w-full bg-slate-100">
            <img
              src={value}
              alt={label || "Uploaded image"}
              className="h-full w-full object-contain"
            />

            {/* Loading overlay */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="mb-2 h-7 w-7 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Uploading image...
                </span>
              </div>
            )}

            {/* Remove */}
            {!uploading && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md transition hover:bg-red-50 hover:text-red-600"
                title="Remove image">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                <ImagePlus className="h-4 w-4 text-green-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-700">
                  Image uploaded
                </p>
                <p className="text-[11px] text-slate-400">Ready to use</p>
              </div>
            </div>

            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:opacity-50">
              Change image
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            group relative flex min-h-[220px] w-full cursor-pointer
            flex-col items-center justify-center
            rounded-xl border-2 border-dashed
            px-6 py-8 text-center
            transition-all duration-200
            ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50"
            }
            ${uploading ? "pointer-events-none opacity-70" : ""}
          `}>
          {/* Upload icon */}
          <div
            className={`
              mb-4 flex h-14 w-14 items-center justify-center
              rounded-2xl transition-all
              ${
                dragActive
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white text-slate-500 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600"
              }
            `}>
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : dragActive ? (
              <UploadCloud className="h-7 w-7" />
            ) : (
              <ImagePlus className="h-7 w-7" />
            )}
          </div>

          {/* Text */}
          {uploading ? (
            <>
              <p className="text-sm font-semibold text-slate-700">
                Uploading image...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait while your image is uploaded
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700">
                Upload an image
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Drag & drop your image here or{" "}
                <span className="font-medium text-blue-600">browse files</span>
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded-md bg-white px-2 py-1 shadow-sm">
                  JPG
                </span>

                <span className="rounded-md bg-white px-2 py-1 shadow-sm">
                  PNG
                </span>

                <span className="rounded-md bg-white px-2 py-1 shadow-sm">
                  WEBP
                </span>

                <span className="ml-1">Max 10MB</span>
              </div>
            </>
          )}

          {/* Mobile camera hint */}
          {!uploading && (
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Camera className="h-3.5 w-3.5" />
              <span>Camera supported on mobile</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            capture="environment"
            disabled={uploading}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <span className="mt-0.5 text-xs text-red-500">●</span>

          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Helper text */}
      {!value && !error && (
        <p className="text-xs text-slate-400">
          Upload a clear image. Supported formats: JPG, PNG, WEBP.
        </p>
      )}
    </div>
  );
}
