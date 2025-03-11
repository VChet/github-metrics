import mimeType from "mime-types";

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
  const fileExtension = mimeType.extension(type);
  link.href = window.URL.createObjectURL(blob);
  link.download = `${fileName}.${fileExtension}`;
  link.click();
  link.remove();
}
