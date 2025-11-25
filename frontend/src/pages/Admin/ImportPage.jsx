import CSVImportPanel from '../../components/Admin/CSVImportPanel'

export default function ImportPage() {
  // Dummy onImportComplete function for now
  const handleImportComplete = () => {
    console.log('Import complete, refetching products...')
  }
  return <CSVImportPanel onImportComplete={handleImportComplete} />
}
