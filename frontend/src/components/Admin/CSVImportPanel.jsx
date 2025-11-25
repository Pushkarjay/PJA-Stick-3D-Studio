import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Download } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function CSVImportPanel() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null); // Clear previous results
    } else {
      toast.error('Please select a valid CSV file.');
      setFile(null);
      e.target.value = ''; // Reset file input
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    setLoading(true);
    setResult(null);
    const toastId = toast.loading('Importing CSV...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = await user.getIdToken();

      const data = await apiRequest('/api/import/products-csv', {
        method: 'POST',
        body: formData
      }, token);
      
      setResult(data);
      toast.success(`Import complete! ${data.success} successful, ${data.failed} failed.`, { id: toastId });
      setFile(null);
      // Reset the file input visually
      const fileInput = document.getElementById('csv-file-input');
      if(fileInput) fileInput.value = '';

    } catch (error) {
      setResult({ error: error.message || 'Error importing CSV' });
      toast.error(`Import failed: ${error.message}`, { id: toastId });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,category_slug,category_name,description,basePrice,stockQty,productionTime,isActive,tags,features,images,cost,specifications
"Sample PLA Filament",pla-filaments,"PLA Filaments","High-quality 1.75mm PLA filament for 3D printing.",1200,100,"1-2 days",true,"pla|filament|1.75mm","1kg spool|High precision","https://example.com/image1.jpg|https://example.com/image2.jpg","{""material"": 500, ""shipping"": 150}","{""diameter"": ""1.75mm"", ""color"": ""White""}"
"Custom Vinyl Sticker",custom-stickers,"Custom Stickers","Durable, waterproof vinyl stickers, fully customizable.",150,500,"3-5 days",true,"vinyl|custom|waterproof","Die-cut|UV resistant","https://example.com/sticker.jpg","{""material"": 50, ""shipping"": 20}","{""size"": ""3x3 inch""}"
`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pja3d-product-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">CSV Product Import</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instructions Column */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-slate-800">Instructions</h3>
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border border-slate-200">
            <p><strong className="text-slate-700">Required columns:</strong> <code className="font-mono">name</code>, <code className="font-mono">category_slug</code>, <code className="font-mono">basePrice</code></p>
            <p><strong className="text-slate-700">Optional columns:</strong> <code className="font-mono">category_name</code>, <code className="font-mono">description</code>, <code className="font-mono">stockQty</code>, <code className="font-mono">productionTime</code>, <code className="font-mono">isActive</code>, <code className="font-mono">tags</code>, <code className="font-mono">features</code>, <code className="font-mono">images</code>, <code className="font-mono">cost</code>, <code className="font-mono">specifications</code></p>
            <p className="mt-2"><strong className="text-slate-700">Multiple Values:</strong> For <code className="font-mono">tags</code>, <code className="font-mono">features</code>, and <code className="font-mono">images</code>, separate values with a pipe character (<code className="font-mono">|</code>).</p>
            <p><strong className="text-slate-700">JSON Fields:</strong> For <code className="font-mono">cost</code> and <code className="font-mono">specifications</code>, use valid JSON format enclosed in double quotes.</p>
            <p className="mt-2 text-indigo-600 font-medium">💡 If a <code className="font-mono">category_slug</code> does not exist, it will be automatically created. Provide a <code className="font-mono">category_name</code> for a more descriptive name.</p>
          </div>
          
          <button
            onClick={downloadTemplate}
            className="btn btn-outline w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template CSV
          </button>
        </div>

        {/* Import Column */}
        <div className="space-y-4">
           <h3 className="font-semibold text-lg text-slate-800">Upload File</h3>
          <form onSubmit={handleImport} className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700" htmlFor="csv-file-input">Select CSV File</label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="btn btn-primary w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Importing...' : 'Import Products'}
            </button>
          </form>

          {result && (
            <div className="space-y-4">
              {result.error ? (
                <div className="alert alert-error">
                  <XCircle className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold">Import Failed</h3>
                    <div className="text-xs">{result.error}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="alert alert-success">
                     <CheckCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">Import Completed!</h3>
                      <div className="text-xs">
                        {result.success} products imported, {result.failed} failed.
                      </div>
                    </div>
                  </div>

                  {result.errors && result.errors.length > 0 && (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg max-h-64 overflow-y-auto border border-yellow-200">
                      <p className="font-semibold mb-2">Import Errors:</p>
                      <ul className="space-y-2">
                        {result.errors.map((err, idx) => (
                          <li key={idx} className="text-xs border-b border-yellow-200 pb-2">
                            <p><strong>Row {err.row}:</strong> <span className="text-red-600">{err.error}</span></p>
                            <p className="font-mono bg-yellow-100 p-1 rounded mt-1 truncate">Data: {JSON.stringify(err.data)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
