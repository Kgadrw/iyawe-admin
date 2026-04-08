'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiRequest } from '@/lib/api'
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, Image as ImageIcon, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HandoverPoint {
  _id?: string
  id?: string
  userId?: string
  name: string
  type: 'POLICE_STATION' | 'BANK' | 'UNIVERSITY' | 'SECTOR_OFFICE' | 'OTHER'
  address: string
  phone: string
  email: string
  isActive: boolean
  image?: string
  subscriptionEnd?: string
  createdAt?: string
  updatedAt?: string
}

export default function HandoverPointsPage() {
  const [handoverPoints, setHandoverPoints] = useState<HandoverPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPoint, setEditingPoint] = useState<HandoverPoint | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'POLICE_STATION' as HandoverPoint['type'],
    address: '',
    phone: '',
    email: '',
    isActive: true,
    image: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchHandoverPoints()
  }, [])

  const fetchHandoverPoints = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/admin/institutions')
      if (response.ok) {
        const data = await response.json()
        setHandoverPoints(data.institutions || [])
      }
    } catch (error) {
      console.error('Error fetching handover points:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (point?: HandoverPoint) => {
    if (point) {
      setEditingPoint(point)
      setFormData({
        name: point.name,
        type: point.type,
        address: point.address,
        phone: point.phone,
        email: point.email,
        isActive: point.isActive,
        image: point.image || '',
      })
      setImagePreview(point.image || null)
      setImageFile(null)
    } else {
      setEditingPoint(null)
      setFormData({
        name: '',
        type: 'POLICE_STATION',
        address: '',
        phone: '',
        email: '',
        isActive: true,
        image: '',
      })
      setImagePreview(null)
      setImageFile(null)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingPoint(null)
    setFormData({
      name: '',
      type: 'POLICE_STATION',
      address: '',
      phone: '',
      email: '',
      isActive: true,
      image: '',
    })
    setImagePreview(null)
    setImageFile(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingPoint
        ? `/api/admin/institutions/${editingPoint._id || editingPoint.id}`
        : '/api/admin/institutions'
      
      const method = editingPoint ? 'PUT' : 'POST'

      let response: Response

      // If there's an image file, use FormData
      if (imageFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name)
        formDataToSend.append('type', formData.type)
        formDataToSend.append('address', formData.address)
        formDataToSend.append('phone', formData.phone)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('isActive', formData.isActive.toString())
        formDataToSend.append('image', imageFile)

        response = await apiRequest(url, {
          method,
          body: formDataToSend,
        })
      } else if (formData.image) {
        // If there's an existing image (base64), send it in JSON
        response = await apiRequest(url, {
          method,
          body: JSON.stringify(formData),
        })
      } else {
        // No image, send JSON
        const { image, ...dataWithoutImage } = formData
        response = await apiRequest(url, {
          method,
          body: JSON.stringify(dataWithoutImage),
        })
      }

      if (response.ok) {
        await fetchHandoverPoints()
        handleCloseDialog()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save handover point')
      }
    } catch (error) {
      console.error('Error saving handover point:', error)
      alert('An error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this handover point?')) {
      return
    }

    try {
      const response = await apiRequest(`/api/admin/institutions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchHandoverPoints()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete handover point')
      }
    } catch (error) {
      console.error('Error deleting handover point:', error)
      alert('An error occurred while deleting')
    }
  }

  const toggleActive = async (point: HandoverPoint) => {
    try {
      const response = await apiRequest(`/api/admin/institutions/${point._id || point.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...point,
          isActive: !point.isActive,
        }),
      })

      if (response.ok) {
        await fetchHandoverPoints()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Handover Point
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPoint ? 'Edit Handover Point' : 'Add New Handover Point'}
              </DialogTitle>
              <DialogDescription>
                {editingPoint
                  ? 'Update the handover point information'
                  : 'Create a new handover point where documents can be collected'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Kigali Central Police Station"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as HandoverPoint['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POLICE_STATION">Police Station</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="UNIVERSITY">University</SelectItem>
                    <SelectItem value="SECTOR_OFFICE">Sector Office</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Full address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+250 788 123 456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Place Image (Optional)</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-2xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <Label
                      htmlFor="image"
                      className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
                    >
                      Click to upload image
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-full">
                  {submitting ? 'Saving...' : editingPoint ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Handover Points</CardTitle>
          <CardDescription>
            {handoverPoints.length} handover point{handoverPoints.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {handoverPoints.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No handover points found</p>
              <p className="text-sm text-gray-400 mt-2">Click "Add Handover Point" to create one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {handoverPoints.map((point) => (
                    <TableRow key={point._id || point.id}>
                      <TableCell>
                        {point.image ? (
                          <img
                            src={point.image}
                            alt={point.name}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{point.name}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {point.type.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{point.address}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{point.phone}</div>
                          <div className="text-gray-500">{point.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleActive(point)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            point.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {point.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(point)}
                            className="rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(point._id || point.id || '')}
                            className="rounded-full"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
