'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiRequest } from '@/lib/api'
import { FileCheck, Search, Eye, Plus, Upload, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface FoundDocument {
  _id?: string
  id?: string
  documentType: string
  documentNumber?: string
  description?: string
  foundDate?: string
  foundLocation?: string
  image?: string
  status: string
  isUrgent?: boolean
  urgentMessage?: string
  createdAt: string
  uploaderName?: string
  uploaderEmail?: string
  uploaderPhone?: string
  user?: {
    name: string
    email: string
    phone?: string
  }
}

const DOCUMENT_TYPES = [
  { value: 'ID_CARD', label: 'ID Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'ATM_CARD', label: 'ATM Card' },
  { value: 'STUDENT_CARD', label: 'Student Card' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'OTHER', label: 'Other' },
]

export default function FoundDocumentsPage() {
  const [documents, setDocuments] = useState<FoundDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<FoundDocument | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadFoundOpen, setUploadFoundOpen] = useState(false)
  const [uploadLostOpen, setUploadLostOpen] = useState(false)
  const [urgentDialogOpen, setUrgentDialogOpen] = useState(false)
  const [selectedUrgentDoc, setSelectedUrgentDoc] = useState<FoundDocument | null>(null)
  const [urgentMessage, setUrgentMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    description: '',
    foundLocation: '',
    uploaderName: '',
    uploaderEmail: '',
    uploaderPhone: '',
  })
  const [lostFormData, setLostFormData] = useState({
    documentType: '',
    documentNumber: '',
    description: '',
    lostDate: '',
    lostLocation: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
  })

  useEffect(() => {
    fetchFoundDocuments()
  }, [])

  const fetchFoundDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/admin/reports/found')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching found documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (doc: FoundDocument) => {
    setSelectedDocument(doc)
    setDialogOpen(true)
  }

  const handleToggleUrgent = (doc: FoundDocument) => {
    setSelectedUrgentDoc(doc)
    setUrgentMessage(doc.urgentMessage || '')
    setUrgentDialogOpen(true)
  }

  const handleSaveUrgent = async () => {
    if (!selectedUrgentDoc) return
    
    try {
      const response = await apiRequest(`/api/admin/reports/found/${selectedUrgentDoc.id || selectedUrgentDoc._id}/urgent`, {
        method: 'PUT',
        body: JSON.stringify({ 
          isUrgent: !selectedUrgentDoc.isUrgent || true,
          urgentMessage: urgentMessage.trim() || undefined
        }),
      })
      
      if (response.ok) {
        setUrgentDialogOpen(false)
        setSelectedUrgentDoc(null)
        setUrgentMessage('')
        await fetchFoundDocuments()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update urgent status')
      }
    } catch (error) {
      console.error('Error updating urgent status:', error)
      alert('An error occurred while updating urgent status')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadFound = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let response: Response

      if (imageFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('documentType', formData.documentType)
        formDataToSend.append('documentNumber', formData.documentNumber || '')
        formDataToSend.append('description', formData.description || '')
        formDataToSend.append('foundLocation', formData.foundLocation)
        formDataToSend.append('uploaderName', formData.uploaderName || 'Admin')
        formDataToSend.append('uploaderEmail', formData.uploaderEmail || 'admin@iyawe.com')
        formDataToSend.append('uploaderPhone', formData.uploaderPhone || '')
        formDataToSend.append('image', imageFile)

        response = await apiRequest('/api/reports/found', {
          method: 'POST',
          body: formDataToSend,
        })
      } else {
        response = await apiRequest('/api/reports/found', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            uploaderName: formData.uploaderName || 'Admin',
            uploaderEmail: formData.uploaderEmail || 'admin@iyawe.com',
          }),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to upload document')
        return
      }

      alert(`Document uploaded successfully! ${data.matchesFound || 0} potential matches found.`)
      
      // Reset form
      setFormData({
        documentType: '',
        documentNumber: '',
        description: '',
        foundLocation: '',
        uploaderName: '',
        uploaderEmail: '',
        uploaderPhone: '',
      })
      setImageFile(null)
      setImagePreview(null)
      setUploadFoundOpen(false)
      
      // Refresh documents list
      await fetchFoundDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('An error occurred while uploading the document')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadLost = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const response = await apiRequest('/api/reports/lost', {
        method: 'POST',
        body: JSON.stringify({
          ...lostFormData,
          reporterName: lostFormData.reporterName || 'Admin',
          reporterEmail: lostFormData.reporterEmail || 'admin@iyawe.com',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to report lost document')
        return
      }

      alert(`Lost document reported successfully! ${data.matchesFound || 0} potential matches found.`)
      
      // Reset form
      setLostFormData({
        documentType: '',
        documentNumber: '',
        description: '',
        lostDate: '',
        lostLocation: '',
        reporterName: '',
        reporterEmail: '',
        reporterPhone: '',
      })
      setUploadLostOpen(false)
      
      // Refresh documents list
      await fetchFoundDocuments()
    } catch (error) {
      console.error('Error reporting lost document:', error)
      alert('An error occurred while reporting the lost document')
    } finally {
      setUploading(false)
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      doc.documentType?.toLowerCase().includes(query) ||
      doc.documentNumber?.toLowerCase().includes(query) ||
      doc.foundLocation?.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.uploaderName?.toLowerCase().includes(query) ||
      doc.user?.name?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-end gap-2">
        <Dialog open={uploadLostOpen} onOpenChange={setUploadLostOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Upload Lost
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Lost Document</DialogTitle>
                <DialogDescription>
                  Report a lost document as an admin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadLost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lost-documentType">Document Type *</Label>
                  <Select
                    value={lostFormData.documentType}
                    onValueChange={(value) => setLostFormData({ ...lostFormData, documentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-documentNumber">Document Number</Label>
                  <Input
                    id="lost-documentNumber"
                    value={lostFormData.documentNumber}
                    onChange={(e) => setLostFormData({ ...lostFormData, documentNumber: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-lostDate">Date Lost</Label>
                  <Input
                    id="lost-lostDate"
                    type="date"
                    value={lostFormData.lostDate}
                    onChange={(e) => setLostFormData({ ...lostFormData, lostDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-lostLocation">Location Lost *</Label>
                  <Input
                    id="lost-lostLocation"
                    value={lostFormData.lostLocation}
                    onChange={(e) => setLostFormData({ ...lostFormData, lostLocation: e.target.value })}
                    placeholder="Where was the document lost?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-description">Description</Label>
                  <Textarea
                    id="lost-description"
                    value={lostFormData.description}
                    onChange={(e) => setLostFormData({ ...lostFormData, description: e.target.value })}
                    placeholder="Additional details about the lost document"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-reporterName">Reporter Name</Label>
                  <Input
                    id="lost-reporterName"
                    value={lostFormData.reporterName}
                    onChange={(e) => setLostFormData({ ...lostFormData, reporterName: e.target.value })}
                    placeholder="Optional (defaults to Admin)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-reporterEmail">Reporter Email</Label>
                  <Input
                    id="lost-reporterEmail"
                    type="email"
                    value={lostFormData.reporterEmail}
                    onChange={(e) => setLostFormData({ ...lostFormData, reporterEmail: e.target.value })}
                    placeholder="Optional (defaults to admin@iyawe.com)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lost-reporterPhone">Reporter Phone</Label>
                  <Input
                    id="lost-reporterPhone"
                    type="tel"
                    value={lostFormData.reporterPhone}
                    onChange={(e) => setLostFormData({ ...lostFormData, reporterPhone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setUploadLostOpen(false)} className="rounded-full">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || !lostFormData.documentType || !lostFormData.lostLocation} className="rounded-full">
                    {uploading ? 'Uploading...' : 'Upload Lost Document'}
                  </Button>
                </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={uploadFoundOpen} onOpenChange={setUploadFoundOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Upload Found
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Found Document</DialogTitle>
              <DialogDescription>
                Upload a found document as an admin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadFound} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="found-documentType">Document Type *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-documentNumber">Document Number</Label>
                  <Input
                    id="found-documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-foundLocation">Found Location *</Label>
                  <Input
                    id="found-foundLocation"
                    value={formData.foundLocation}
                    onChange={(e) => setFormData({ ...formData, foundLocation: e.target.value })}
                    placeholder="Where was the document found?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-description">Description</Label>
                  <Textarea
                    id="found-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about the found document"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-image">Document Image</Label>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-contain rounded-2xl border border-gray-200 bg-gray-50"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 rounded-full"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        </div>
                        <input
                          id="found-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-uploaderName">Uploader Name</Label>
                  <Input
                    id="found-uploaderName"
                    value={formData.uploaderName}
                    onChange={(e) => setFormData({ ...formData, uploaderName: e.target.value })}
                    placeholder="Optional (defaults to Admin)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-uploaderEmail">Uploader Email</Label>
                  <Input
                    id="found-uploaderEmail"
                    type="email"
                    value={formData.uploaderEmail}
                    onChange={(e) => setFormData({ ...formData, uploaderEmail: e.target.value })}
                    placeholder="Optional (defaults to admin@iyawe.com)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="found-uploaderPhone">Uploader Phone</Label>
                  <Input
                    id="found-uploaderPhone"
                    type="tel"
                    value={formData.uploaderPhone}
                    onChange={(e) => setFormData({ ...formData, uploaderPhone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setUploadFoundOpen(false)} className="rounded-full">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || !formData.documentType || !formData.foundLocation} className="rounded-full">
                    {uploading ? 'Uploading...' : 'Upload Found Document'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>


      {/* Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Found Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No documents match your search' : 'No found documents found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Found Date</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc._id || doc.id}>
                      <TableCell className="font-medium">
                        {doc.documentType?.replace(/_/g, ' ') || 'Document'}
                      </TableCell>
                      <TableCell>
                        {doc.documentNumber || '-'}
                      </TableCell>
                      <TableCell>
                        {doc.foundLocation || '-'}
                      </TableCell>
                      <TableCell>
                        {doc.foundDate
                          ? new Date(doc.foundDate).toLocaleDateString()
                          : new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {doc.user?.name || doc.uploaderName || 'Anonymous'}
                          </div>
                          <div className="text-gray-500">
                            {doc.user?.email || doc.uploaderEmail || ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          doc.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' :
                          doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                          doc.status === 'HANDED_OVER' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={doc.isUrgent ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleUrgent(doc)}
                          className={doc.isUrgent ? "bg-orange-600 hover:bg-orange-700 text-white rounded-full" : "rounded-full"}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {doc.isUrgent ? 'Edit Urgent' : 'Mark Urgent'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(doc)}
                          className="rounded-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Found Document Details</DialogTitle>
            <DialogDescription>
              Complete information about this found document
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              {selectedDocument.image && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Document Image</label>
                  <img
                    src={selectedDocument.image}
                    alt="Document"
                    className="w-full h-64 object-contain rounded-2xl border border-gray-200 bg-gray-50 mt-2"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Document Type</label>
                <p className="text-gray-900">{selectedDocument.documentType?.replace(/_/g, ' ') || 'Document'}</p>
              </div>
              {selectedDocument.documentNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Document Number</label>
                  <p className="text-gray-900">{selectedDocument.documentNumber}</p>
                </div>
              )}
              {selectedDocument.foundLocation && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Found Location</label>
                  <p className="text-gray-900">{selectedDocument.foundLocation}</p>
                </div>
              )}
              {selectedDocument.foundDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Found Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedDocument.foundDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {selectedDocument.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedDocument.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedDocument.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    selectedDocument.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' :
                    selectedDocument.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedDocument.status}
                  </span>
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">Uploader Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>{' '}
                    <span className="text-gray-900">
                      {selectedDocument.user?.name || selectedDocument.uploaderName || 'Anonymous'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>{' '}
                    <span className="text-gray-900">
                      {selectedDocument.user?.email || selectedDocument.uploaderEmail || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>{' '}
                    <span className="text-gray-900">
                      {selectedDocument.user?.phone || selectedDocument.uploaderPhone || '-'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Uploaded On</label>
                <p className="text-gray-900">
                  {new Date(selectedDocument.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Urgent Status Dialog */}
      <Dialog open={urgentDialogOpen} onOpenChange={setUrgentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUrgentDoc?.isUrgent ? 'Edit Urgent Notification' : 'Mark as Urgent'}
            </DialogTitle>
            <DialogDescription>
              {selectedUrgentDoc?.isUrgent 
                ? 'Update the urgent notification message for this document'
                : 'Set a custom notification message to display at the top of the frontend'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urgentMessage">Custom Notification Message</Label>
              <Textarea
                id="urgentMessage"
                value={urgentMessage}
                onChange={(e) => setUrgentMessage(e.target.value)}
                placeholder="e.g., 🚨 URGENT: Found ID Card in Kigali CBD – Claim immediately!"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Leave empty to use default message with document details
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setUrgentDialogOpen(false)
                  setSelectedUrgentDoc(null)
                  setUrgentMessage('')
                }}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSaveUrgent}
                className="bg-orange-600 hover:bg-orange-700 rounded-full"
              >
                {selectedUrgentDoc?.isUrgent ? 'Update' : 'Mark as Urgent'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
