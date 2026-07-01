import { MIME_EXTENSIONS } from "@/constants/mime";

export function readFile(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (): void => { if (reader.result) resolve(reader.result); };
    reader.onerror = reject;
  });
}

export function downloadFile(data: BlobPart, fileName: File["name"], type: File["type"]): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const link = window.document.createElement("a");
  const fileExtension = MIME_EXTENSIONS[type];
  if (!fileExtension) throw new Error(`Invalid file extension for MIME type: ${type}`);
  link.href = window.URL.createObjectURL(blob);
  link.download = `${fileName}.${fileExtension}`;
  link.click();
  link.remove();
}
