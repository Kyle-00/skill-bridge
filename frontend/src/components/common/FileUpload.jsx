import { useRef, useState } from 'react';
import api from '../../api/axiosConfig';

const FileUpload = ({ purpose = 'any', label = 'Upload file', multiple = false, onUploaded }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const selected = multiple ? Array.from(e.target.files) : [e.target.files[0]];
    if (!selected[0]) return;

    setBusy(true);
    setError('');
    for (const file of selected) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', purpose);
      try {
        const res = await api.post('uploads/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onUploaded(file, res.data.url);
      } catch (err) {
        setError(err.response?.data?.error || `Upload failed for ${file.name}`);
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        onChange={handleFile}
        className="hidden"
        id={`upload-${purpose}-${multiple ? 'multi' : 'single'}`}
      />
      <label
        htmlFor={`upload-${purpose}-${multiple ? 'multi' : 'single'}`}
        className={`inline-block text-xs px-4 py-2 rounded-full border border-gold-400 dark:border-gold-600 text-gold-700 dark:text-gold-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 transition cursor-pointer ${busy ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {busy ? 'Uploading...' : `📎 ${label}`}
      </label>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default FileUpload;