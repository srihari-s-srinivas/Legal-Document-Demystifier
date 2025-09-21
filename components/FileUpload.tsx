import React, { useCallback, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface FileUploadProps {
  onFilesSelected: (files: { fileName: string, content: string }[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    console.warn("PDF text extraction is mocked. In a real app, use a library like PDF.js.");
    const arrayBuffer = await file.arrayBuffer();
    await PDFDocument.load(arrayBuffer);
    return `(Simulated text from ${file.name})\n\nThis is a placeholder for the extracted text from the PDF document. A complete implementation would use a library like Mozilla's PDF.js to parse and extract the actual text content from each page of the PDF file. The content would appear here, maintaining its structure as much as possible.`;
  };

  const handleFileChange = useCallback(async (files: FileList | null) => {
    setError(null);
    setFileNames([]);
    if (!files || files.length === 0) return;
    
    const selectedFiles: { fileName: string, content: string }[] = [];
    const names: string[] = [];

    for (const file of Array.from(files)) {
        if (file.type === 'text/plain') {
          const content = await file.text();
          selectedFiles.push({ fileName: file.name, content });
          names.push(file.name);
        } else if (file.type === 'application/pdf') {
           try {
            const content = await extractTextFromPdf(file);
            selectedFiles.push({ fileName: file.name, content });
            names.push(file.name);
           } catch (err) {
            console.error("Error processing PDF:", err);
            setError(`Could not process ${file.name}.`);
            return; // Stop processing if one file fails
           }
        } else {
          setError(`File type for ${file.name} is not supported. Please use .txt or .pdf.`);
          return; // Stop processing
        }
    }
    setFileNames(names);
    onFilesSelected(selectedFiles);
  }, [onFilesSelected]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-300 bg-slate-50'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt,.pdf"
          multiple // Allow multiple files
          onChange={(e) => handleFileChange(e.target.files)}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          <span className="mt-4 block font-semibold text-slate-700">
            Click to upload or drag and drop
          </span>
          <span className="block text-sm text-slate-500">Select multiple TXT or PDF files</span>
        </label>
      </div>
       {fileNames.length > 0 && (
          <div className="mt-6 text-sm text-slate-700">
            <p className="font-semibold mb-2">Selected files:</p>
            <ul className="space-y-2">
                {fileNames.map(name => 
                <li key={name} className="flex items-center bg-green-50 text-green-800 p-2 rounded-md border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{name}</span>
                </li>)}
            </ul>
          </div>
        )}
        {error && (
            <p className="mt-4 text-sm font-medium text-red-600 p-3 bg-red-50 rounded-md border border-red-200">
                {error}
            </p>
        )}
    </div>
  );
};