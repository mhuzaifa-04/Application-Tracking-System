import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ file }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(500);

  const containerRef = useRef<HTMLDivElement>(null);

  // Automatically measure available parent width
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          // Account for 32px padding (16px on each side)
          setContainerWidth(Math.floor(entry.contentRect.width - 32));
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-sm">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 text-slate-300 text-xs border-b border-slate-800 shrink-0">
        {/* Pagination */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="tabular-nums">
            {pageNumber} / {numPages || '--'}
          </span>
          <button
            onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
            disabled={!numPages || pageNumber >= numPages}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.6))}
            className="p-1.5 rounded hover:bg-slate-800 cursor-pointer transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-mono text-[11px]">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 1.8))}
            className="p-1.5 rounded hover:bg-slate-800 cursor-pointer transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(1.0)}
            className="p-1.5 ml-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 flex justify-center items-start bg-slate-950/60"
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-slate-400 text-xs py-16 flex items-center justify-center">
              Rendering document...
            </div>
          }
          error={
            <div className="text-rose-400 text-xs py-16 text-center">
              Failed to load PDF preview.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={containerWidth * scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-2xl rounded-sm overflow-hidden border border-slate-700/50"
          />
        </Document>
      </div>
    </div>
  );
};