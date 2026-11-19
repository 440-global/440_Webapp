"use client";

import { useRef, useState, useEffect } from "react";
import {
  RiFileImageLine,
  RiFilePdfLine,
  RiFileTextLine,
  RiCloseLine,
  RiFile2Line,
} from "react-icons/ri";
import axios from "axios";
import { useUploadFiles } from "@/api/upload";

type FileType = "image" | "document" | "custom";

export type UploadedFile = { url: string; file: File };

type UploadFile = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  url?: string;
  error?: string;
};

type Props = {
  label?: string;
  name: string;
  multiple?: boolean;
  fileType?: FileType;
  accept?: string;
  maxSizeMB?: number;
  onFilesChange: (files: UploadedFile[]) => void;
  initialUrls?: string[];
};

const fileTypeMap: Record<FileType, string> = {
  image: "image/*",
  document: ".pdf,.doc,.docx,.txt",
  custom: "",
};

const FileUpload = ({
  label,
  name,
  multiple = true,
  fileType = "image",
  accept,
  maxSizeMB = 30,
  onFilesChange,
  initialUrls = [],
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>(() =>
    initialUrls.map((url) => ({
      id: crypto.randomUUID(),
      file: new File([], url.split("/").pop() || "file"),
      preview: url,
      progress: 100,
      url,
    })),
  );
  const [dragging, setDragging] = useState(false);

  const acceptedTypes = accept || fileTypeMap[fileType];
  const { mutateAsync: uploadFiles } = useUploadFiles();

  // Cleanup URLs to avoid memory leaks
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(
    () => () => {
      filesRef.current.forEach((f) => {
        if (f.preview.startsWith("blob:")) URL.revokeObjectURL(f.preview);
      });
    },
    [],
  );

  useEffect(() => {
    const uploaded = files
      .filter((f) => f.progress === 100 && f.url)
      .map((f) => ({ url: f.url as string, file: f.file }));

    onFilesChange(uploaded);
  }, [files]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const selected: UploadFile[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.size > maxSizeBytes) {
        // File too large → add with error (or skip entirely)
        selected.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          error: `Max size is ${maxSizeMB}MB`,
        });
      } else {
        // Valid file
        selected.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
        });
      }
    });

    // single-file mode: the old entries are about to be dropped, so free their blob URLs
    if (!multiple) {
      filesRef.current.forEach((f) => {
        if (f.preview.startsWith("blob:")) URL.revokeObjectURL(f.preview);
      });
    }

    setFiles((prev) => (multiple ? [...prev, ...selected] : selected));

    // only upload valid files
    selected.forEach((f) => {
      if (!f.error) uploadFile(f.id, f.file);
    });
  };

  const uploadFile = async (id: string, file: File) => {
    try {
      const { uploadUrl, publicUrl } = await uploadFiles({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        contentLength: file.size,
        folder: "misc",
      });

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const progress = Math.min(99, Math.round((e.loaded * 100) / e.total));
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress } : f)),
          );
        },
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, progress: 100, url: publicUrl } : f,
        ),
      );
    } catch (error) {
      console.error("Upload failed:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, progress: 0, error: "Upload failed" } : f,
        ),
      );
    }
  };

  const retryUpload = (id: string) => {
    const fileToRetry = files.find((f) => f.id === id);
    if (!fileToRetry) return;

    // reset state before retry
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, progress: 0, error: undefined } : f,
      ),
    );

    uploadFile(id, fileToRetry.file);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview.startsWith("blob:"))
        URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  };
  // onClick={() => removeFile(item.id)} and key={item.id}

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image")) return <RiFileImageLine />;
    if (file.type.includes("pdf")) return <RiFilePdfLine />;
    return <RiFileTextLine />;
  };

  const uploadedFiles = files.filter((f) => f.progress === 100);

  const truncateText = (str: string, words: number) => {
    return str.slice(0, words) + "...";
  };

  return (
    <div className="space-y-3">
      {label && <label className="font-semibold block mb-1">{label}</label>}

      {/* DROP ZONE */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-slate-500 text-center cursor-pointer
          ${dragging ? "border-black bg-gray-100" : "border-gray-300"} hover:border-(--primary) hover:text-(--primary)`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <RiFile2Line size={36} className="mx-auto mb-2" />
        Drag & drop files or <span className="underline">click to upload</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple={multiple}
        accept={acceptedTypes}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* UPLOADING LIST */}
      {files.map((f) => (
        <div
          key={f.id}
          className="border border-(--table-border) rounded-lg p-2"
        >
          <p className="text-sm">{truncateText(f.file.name, 30)}</p>

          {f.error ? (
            <div className="flex justify-between items-center">
              <span className="text-red-500 text-sm">{f.error}</span>
              <button
                type="button"
                onClick={() => retryUpload(f.id)}
                className="text-xs underline"
              >
                Retry
              </button>
            </div>
          ) : f.progress < 100 ? (
            // ONLY show progress if still uploading
            <div className="h-2 bg-gray-200 rounded mt-1">
              <div
                className="h-full bg-black rounded"
                style={{ width: `${f.progress}%` }}
              />
            </div>
          ) : (
            // Uploaded state
            <span className="text-green-600 text-sm">Uploaded</span>
          )}
        </div>
      ))}

      {/* ICON PREVIEW (BOTTOM) */}
      {uploadedFiles.length > 0 && (
        <div className="flex gap-3 flex-wrap pt-2">
          {uploadedFiles.map((item) => {
            const isImage =
              item.file.type.startsWith("image") ||
              /\.(png|jpe?g|gif|webp|svg)$/i.test(item.url ?? "");

            return (
              <div
                key={item.id}
                className="relative w-14 h-14 border border-(--table-border) rounded-lg flex items-center justify-center"
              >
                {isImage ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl">{getFileIcon(item.file)}</span>
                )}

                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                >
                  <RiCloseLine size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;