import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {label && (
        <label className="block text-sm font-medium mb-2 px-4 pt-4">
          {label}
        </label>
      )}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Enter content...'}
        className="bg-white"
      />
      <style>{`
        .quill {
          height: 200px;
          display: flex;
          flex-direction: column;
        }
        .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: 14px;
        }
        .ql-editor {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}
