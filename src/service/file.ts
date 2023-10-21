export function readFile(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      if (reader.result) resolve(reader.result);
    };
    reader.onerror = reject;
  });
}

export function downloadFile(data: any, fileName: string, type: string = "text/xml"): void {
  const blob = new Blob([data], { type });
  const element = window.document.createElement("a");
  element.href = window.URL.createObjectURL(blob);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
