import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelect }) => {
  // Local state: tracks if a user is dragging a file over the box
  const [isDragging, setIsDragging] = useState<boolean>(false);
  // Local state: tracks the selected file for display
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Local state: tracks error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileValidation = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a PDF or DOCX file.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be under 5MB.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    onFileSelect(file); // Pass the validated file back to the parent component
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileValidation(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleInputChange}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-base font-medium text-slate-800 mb-1">
            <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-slate-500">PDF or DOCX (Max 5MB)</p>
        </label>
      </div>

      {/* Selected File Feedback */}
      {selectedFile && !errorMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">{selectedFile.name}</span>
            <span className="text-xs text-emerald-600">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span className="text-sm font-medium text-rose-900">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};