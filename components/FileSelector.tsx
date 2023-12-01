"use client";
import React, { useRef, useState, type ChangeEvent } from "react";

export interface FileSelectorProps {
  onFileSelect: (file: File) => void;
}

export function FileSelector({ onFileSelect }: FileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files ? event.target?.files[0] : null;
    if (file) {
      setSelectedFile(file.name);
      onFileSelect(file);
    } else {
      console.error("No file selected");
    }
  };

  return (
    <div className="px-6 pt-4 pb-2">
      <input
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        onClick={handleButtonClick}
      >
        <svg
          className="fill-current w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M13 8V1H3v18h14V8h-4zM4 2h7v5h5v11H4V2zm9 11h-3v3H8v-3H5l5-5 5 5z" />
        </svg>
        {selectedFile ? selectedFile : "Import PDF file"}
      </button>
    </div>
  );
}
