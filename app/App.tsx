"use client";

import { useCallback, useEffect, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { parse, refine } from "./actions";
import type { PDFTextContent } from "../types";

import { FileSelector } from "@/components/FileSelector";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const resizeObserverOptions = {};

const maxWidth = 500;

type PDFFile = string | File | null;

export default function App() {
  const [textContents, setTextContents] = useState<PDFTextContent[]>([]);
  const [previewText, setPreviewText] = useState<string>("LOADING...");
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<PDFFile>("/sample.pdf");
  const [pageNum, setPageNum] = useState<number>(0);
  const [numPages, setNumPages] = useState<number>(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  useEffect(() => {
    (async () => {
      const blob = await fetch("/sample.pdf").then((r) => r.blob());
      const f = new File([blob], "sample.pdf", { type: "application/pdf" });
      await onFileChange(f);
    })();
  }, []);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  async function onFileChange(file: File): Promise<void> {
    setFile(file);
    const result = await parse(file);
    if (result.textContent[0]) {
      setTextContents(result.textContent);
      setPreviewText("LOADING...");
      const ret = await refine("", result.textContent[0].content);
      setPreviewText(ret);
    }
  }

  function onDocumentLoadSuccess(pdfDocument: PDFDocumentProxy): void {
    setNumPages(pdfDocument.numPages);
    setPageNum(1);
  }

  return (
    <div className="flex justify-center gap-4 items-start">
      <div className="flex-1 flex justify-end flex-col">
        <FileSelector onFileSelect={onFileChange} />
        <div className="flex px-4 min-h-[525px]">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            <Page
              pageNumber={pageNum}
              height={
                containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
              }
            />
          </Document>
        </div>
        <div className="flex px-4">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 mx-2 px-4 rounded inline-flex items-center"
            disabled={loading}
            onClick={async (e) => {
              setPageNum((prev) => Math.max(prev - 1, 1));
              const text = textContents[pageNum]?.content;
              if (text && text?.length > 0) {
                setLoading(true);
                setPreviewText("LOADING...");
                const ret = await refine("", text);
                setPreviewText(ret);
                setLoading(false);
              }
            }}
          >
            Prev
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 mx-2 px-4 rounded inline-flex items-center"
            onClick={async (e) => {
              setPageNum((prev) => (prev === numPages ? numPages : prev + 1));

              const text = textContents[pageNum]?.content;
              if (text && text?.length > 0) {
                setLoading(true);
                setPreviewText("LOADING...");
                const ret = await refine("", text);
                setPreviewText(ret);
                setLoading(false);
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex-1 flex justify-start flex-col">
        <div className="flex flex-col h-screen">
          <textarea
            value={previewText}
            readOnly={true}
            className="flex-grow p-2 border-2 border-gray-300 rounded resize-none"
          />
        </div>
      </div>
    </div>
  );
}
