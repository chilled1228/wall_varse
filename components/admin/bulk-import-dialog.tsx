"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Check,
  X,
  AlertCircle,
  Download,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { wallpaperService } from "@/lib/wallpaper-service"

interface ImportResult {
  success: boolean
  rowNumber: number
  wallpaper?: any
  error?: string
}

interface ImportSummary {
  totalRows: number
  successful: number
  failed: number
  newCategoriesCreated: number
}

export function BulkImportDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [createdCategories, setCreatedCategories] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "INVALID FILE TYPE",
          description: "Please select a CSV file",
          variant: "destructive",
        })
        return
      }
      setCsvFile(file)
      setResults([])
      setSummary(null)
      setCreatedCategories([])
    }
  }

  const handleImport = async () => {
    if (!csvFile) return

    setImporting(true)
    try {
      const result = await wallpaperService.bulkImportWallpapers(csvFile)

      if (result.success && result.summary) {
        setSummary(result.summary)
        setResults(result.results || [])
        setCreatedCategories(result.createdCategories || [])

        toast({
          title: "IMPORT COMPLETED",
          description: `Successfully imported ${result.summary.successful} wallpapers`,
        })

        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "IMPORT FAILED",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: "IMPORT FAILED",
        description: "An error occurred during import",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `title,imageUrl,category,tags,resolution,deviceType,customSlug,description
SAMPLE WALLPAPER,https://picsum.photos/400/600?random=1,nature,"mountain,landscape,beautiful",1080x1920,phone,sample-wallpaper,"A beautiful mountain landscape wallpaper"
EXAMPLE ABSTRACT,https://picsum.photos/400/600?random=2,abstract,"art,colorful,modern",1080x1920,phone,,"Modern colorful abstract art design"
MINIMAL DESIGN,https://picsum.photos/400/600?random=3,minimal,"clean,simple",2560x1440,desktop,minimal-design-wallpaper,"Clean and simple minimal design for desktop"`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wallpaper-import-sample.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetDialog = () => {
    setCsvFile(null)
    setResults([])
    setSummary(null)
    setCreatedCategories([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(resetDialog, 300) // Reset after dialog animation
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="brutalist-border brutalist-shadow font-black">
          <Upload className="h-4 w-4 mr-2" />
          BULK IMPORT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto brutalist-border brutalist-shadow">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">BULK WALLPAPER IMPORT</DialogTitle>
          <DialogDescription>
            Import multiple wallpapers from a CSV file. Categories will be created automatically if they don't exist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card className="brutalist-border bg-muted p-4">
            <h3 className="font-black mb-2">CSV FORMAT REQUIREMENTS:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Required columns:</strong> title, imageUrl, category</p>
              <p><strong>Optional columns:</strong> tags (comma-separated), resolution, deviceType, customSlug, description</p>
              <p><strong>Example:</strong> title,imageUrl,category,tags,resolution,deviceType,customSlug,description</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              className="mt-3 brutalist-border font-bold"
            >
              <Download className="h-3 w-3 mr-1" />
              DOWNLOAD SAMPLE CSV
            </Button>
          </Card>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 brutalist-border brutalist-shadow"
                disabled={importing}
              >
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">
                    {csvFile ? csvFile.name : "SELECT CSV FILE"}
                  </p>
                  {csvFile && (
                    <p className="text-xs text-muted-foreground">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </Button>
            </div>

            {csvFile && !importing && !summary && (
              <Button
                onClick={handleImport}
                className="w-full brutalist-border brutalist-shadow font-black"
                disabled={importing}
              >
                <Upload className="h-4 w-4 mr-2" />
                START IMPORT
              </Button>
            )}

            {importing && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="font-bold">IMPORTING WALLPAPERS...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {summary && (
            <Card className="brutalist-border bg-card p-4">
              <h3 className="font-black mb-4">IMPORT RESULTS</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-600">{summary.totalRows}</p>
                  <p className="text-xs font-bold text-muted-foreground">TOTAL ROWS</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{summary.successful}</p>
                  <p className="text-xs font-bold text-muted-foreground">SUCCESSFUL</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-red-600">{summary.failed}</p>
                  <p className="text-xs font-bold text-muted-foreground">FAILED</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-purple-600">{summary.newCategoriesCreated}</p>
                  <p className="text-xs font-bold text-muted-foreground">NEW CATEGORIES</p>
                </div>
              </div>

              {createdCategories.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold mb-2">NEW CATEGORIES CREATED:</p>
                  <div className="flex flex-wrap gap-1">
                    {createdCategories.map((category) => (
                      <Badge key={category} className="brutalist-border">
                        {category.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Progress
                value={(summary.successful / summary.totalRows) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Success rate: {((summary.successful / summary.totalRows) * 100).toFixed(1)}%
              </p>
            </Card>
          )}

          {/* Detailed Results */}
          {results.length > 0 && (
            <Card className="brutalist-border bg-card p-4">
              <h3 className="font-black mb-4">DETAILED RESULTS</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded brutalist-border ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.success ? (
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">
                        Row {result.rowNumber}
                        {result.wallpaper && `: ${result.wallpaper.title}`}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetDialog}
              className="brutalist-border font-bold"
              disabled={importing}
            >
              RESET
            </Button>
            <Button
              onClick={handleClose}
              className="brutalist-border brutalist-shadow font-black"
            >
              CLOSE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}