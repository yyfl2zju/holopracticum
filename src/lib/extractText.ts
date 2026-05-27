import mammoth from "mammoth";

// pdfjs-dist 5.x uses ESM build with worker. Use legacy build for broad compat.
// We dynamically import to keep initial bundle small.
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return await file.text();
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return await extractPdf(file);
  }
  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return value;
  }
  throw new Error("仅支持 PDF / Word(.docx) / 文本文件，请转换后再上传");
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
  // Use a workerless setup to avoid CORS issues in preview environments.
  pdfjs.GlobalWorkerOptions.workerSrc = await import("pdfjs-dist/build/pdf.worker.mjs?url").then((m: any) => m.default);
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n\n";
  }
  return text.trim();
}