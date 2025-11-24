import { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react'

export default function CSVImportPanel({ user }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = await user.getIdToken()
      const response = await fetch('/api/admin/import-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data.data)
        setFile(null)
      } else {
        setResult({ error: data.error || 'Import failed' })
      }
    } catch (error) {
      setResult({ error: 'Error importing CSV' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,category,subcategory,description,basePrice,baseDiscount,extraDiscount,stock,isAvailable,isActive,images,specifications
"Sample 3D Print",3d-print,miniature,"High-quality 3D printed miniature",500,10,5,100,true,true,"https://example.com/image1.jpg|https://example.com/image2.jpg","{""material"":""PLA"",""color"":""White""}"
"Custom Sticker Pack",stickers,vinyl,"Waterproof vinyl stickers",150,0,10,200,true,true,"https://example.com/sticker.jpg","{""size"":""10cm"",""quantity"":""10""}"
`
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="w-6 h-6" />
        CSV Product Import
      </h2>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <p><strong>Required columns:</strong> name, category, basePrice</p>
            <p><strong>Optional columns:</strong> subcategory, description, baseDiscount, extraDiscount, stock, isAvailable, isActive, images, specifications</p>
            <p><strong>Images:</strong> Separate multiple image URLs with | (pipe character)</p>
            <p><strong>Specifications:</strong> Use JSON format in quotes</p>
            <p className="text-primary-600 font-medium">Categories and subcategories will be auto-created if they don't exist!</p>
          </div>
          
          <button
            onClick={downloadTemplate}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <FileText className="w-4 h-4" />
            Download Template CSV
          </button>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Importing...' : 'Import Products'}
          </button>
        </form>

        {result && (
          <div className="space-y-4">
            {result.error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <p className="font-semibold">Import Failed:</p>
                <p>{result.error}</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  <p className="font-semibold">Import Completed!</p>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {result.success} products imported successfully
                    </p>
                    {result.failed > 0 && (
                      <p className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {result.failed} products failed to import
                      </p>
                    )}
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg max-h-64 overflow-y-auto">
                    <p className="font-semibold mb-2">Errors:</p>
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="text-sm mb-2 border-b border-yellow-300 pb-2">
                        <p>Row: {JSON.stringify(err.row).substring(0, 100)}...</p>
                        <p className="text-red-600">Error: {err.error}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
