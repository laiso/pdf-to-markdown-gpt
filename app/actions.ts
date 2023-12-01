import { getDocument } from "pdfjs-dist";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import type { PDFDocumentInfo, PDFDocument, PDFMetadata } from "../types";

export async function parse(file: File): Promise<PDFDocument> {
  const fileData = await file.arrayBuffer();
  const loadingTask = getDocument(fileData);
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  const metadata = await doc.getMetadata();
  const metaDataInfo = metadata.info;
  const metaDataAll = metadata.metadata ? metadata.metadata.getAll() : {};

  let allTextContent = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: TextItem | TextMarkedContent) => {
        if ("str" in item) {
          return item.str;
        }
        return `MarkedContent: ${item.id}\ntype: ${item.type}\n`;
      })
      .join(" ");
    allTextContent.push({ page: i, content: pageText });
    page.cleanup();
  }

  return {
    documentInfo: metaDataInfo as PDFDocumentInfo,
    metadata: metaDataAll as PDFMetadata,
    textContent: allTextContent,
  };
}

export async function refine(prompt: string, text: string): Promise<string> {
  'use client';
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    params.append('text', text);

    const eventSource = new EventSource('/refine?' + params.toString(), {
      withCredentials: true,
    });
    let s = '';
    eventSource.onmessage = (event) => {
      const byteArray = event.data.split(',').map(Number);
      const uint8Array = new Uint8Array(byteArray);
      const decodedString = new TextDecoder().decode(uint8Array);
      s = s + decodedString;
      try {
        const result = JSON.parse(s).markdown;
        eventSource.close();
        resolve(result);
      } catch (e) {
        // reject(e);
      }
    };
    eventSource.onerror = (event) => {
      eventSource.close();
      reject(event);
    };
  });
}
