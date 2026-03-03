import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Image, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const MAX_FILES = 3;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".heic", ".xlsx", ".csv"];

export interface SelectedFile {
  file: File;
  id: string;
}

interface FileUploadZoneProps {
  files: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("spreadsheet") || type === "text/csv") return FileSpreadsheet;
  return FileText;
}

export function FileUploadZone({ files, onFilesChange }: FileUploadZoneProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback((incoming: FileList | File[]) => {
    const newFiles: SelectedFile[] = [];
    const current = files.length;

    for (const file of Array.from(incoming)) {
      if (current + newFiles.length >= MAX_FILES) {
        toast.error(t("learnSubjects.upload.maxFiles"));
        break;
      }
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(t("learnSubjects.upload.typeNotAllowed"));
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(t("learnSubjects.upload.tooLarge"));
        continue;
      }
      newFiles.push({ file, id: crypto.randomUUID() });
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, onFilesChange, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndAdd(e.dataTransfer.files);
  }, [validateAndAdd]);

  const removeFile = useCallback((id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  }, [files, onFilesChange]);

  return (
    <section className="space-y-5">
      <h2 className="font-display text-lg text-slate-800 border-b border-slate-200 pb-2">
        {t("learnSubjects.upload.title")}
      </h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
          "bg-white/70 backdrop-blur-xl hover:bg-blue-50/50",
          isDragging ? "border-blue-500 bg-blue-50/60" : "border-slate-300",
          files.length >= MAX_FILES && "opacity-50 pointer-events-none"
        )}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400 mb-3" />
        <p className="font-body text-slate-600 text-sm">
          {t("learnSubjects.upload.dragDrop")}
        </p>
        <p className="font-body text-slate-400 text-xs mt-1">
          {t("learnSubjects.upload.fileTypes")}
        </p>
        <p className="font-body text-slate-400 text-xs">
          {t("learnSubjects.upload.maxFiles")}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) validateAndAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map(({ file, id }) => {
            const Icon = getFileIcon(file.type);
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 px-4 py-3"
              >
                <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                <span className="flex-1 truncate text-sm text-slate-700 font-body">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400 font-body">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="rounded-full p-1 hover:bg-rose-100 transition-colors"
                  aria-label={t("learnSubjects.upload.remove")}
                >
                  <X className="h-4 w-4 text-rose-500" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
