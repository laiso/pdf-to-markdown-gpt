export type PDFDocumentInfo = {
  PDFFormatVersion: string;
  Language: string;
  EncryptFilterName: null | string;
  IsLinearized: boolean;
  IsAcroFormPresent: boolean;
  IsXFAPresent: boolean;
  IsCollectionPresent: boolean;
  IsSignaturesPresent: boolean;
  Title: string;
  Author: string;
  CreationDate: string;
  ModDate: string;
  Producer: string;
  Creator: string;
};

export type PDFMetadata = {
  'pdf:producer': string;
  'dc:title': string;
  'dc:creator': string[];
  'xmp:creatortool': string;
  'xmp:createdate': string;
  'xmp:modifydate': string;
  'xmpmm:documentid': string;
  'xmpmm:instanceid': string;
};

export type PDFTextContent = {
  page: number;
  content: string;
};

export type PDFDocument = {
  documentInfo: PDFDocumentInfo;
  metadata: PDFMetadata;
  textContent: PDFTextContent[];
};
