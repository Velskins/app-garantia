declare module "pdfjs-dist/legacy/build/pdf" {
    export const GlobalWorkerOptions: {
      workerSrc: string;
    };
  
    export function getDocument(
      src: { data: Uint8Array } | string
    ): {
      promise: Promise<any>; // 👈 on pourra affiner ce type plus tard si besoin
    };
  }