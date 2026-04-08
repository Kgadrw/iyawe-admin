'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiRequest } from '@/lib/api'
import { Image as ImageIcon, Plus, Edit, Trash2, CheckCircle, XCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Ad {
  _id?: string
  id?: string
  image: string
  link: string
  isActive: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    image: '',
    link: '',
    isActive: true,
    order: 0,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await apiRequest('/api/admin/ads')
      if (response.ok) {
        const data = await response.json()
        setAds(data.ads || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error fetching ads:', response.status, errorData)
        alert(`Failed to fetch ads: ${errorData.error || `Status ${response.status}`}`)
      }
    } catch (error: any) {
      console.error('Error fetching ads:', error)
      alert(`Error fetching ads: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad)
      setFormData({
        image: ad.image || '',
        link: ad.link || '',
        isActive: ad.isActive ?? true,
        order: ad.order || 0,
      })
      setImagePreview(ad.image || null)
      setImageFile(null)
    } else {
      setEditingAd(null)
      setFormData({
        image: '',
        link: '',
        isActive: true,
        order: 0,
      })
      setImagePreview(null)
      setImageFile(null)
    }
    setDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      
      // Handle image: if file exists, send as file; otherwise send as base64 string
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      } else if (formData.image) {
        // Send base64 string as a text field (not as file)
        formDataToSend.append('image', formData.image)
      }
      
      // Add other fields
      if (formData.title) {
        formDataToSend.append('title', formData.title)
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }
      formDataToSend.append('link', formData.link)
      formDataToSend.append('isActive', formData.isActive.toString())
      formDataToSend.append('order', formData.order.toString())

      let response
      if (editingAd) {
        response = await apiRequest(`/api/admin/ads/${editingAd.id || editingAd._id}`, {
          method: 'PUT',
          body: formDataToSend,
        })
      } else {
        response = await apiRequest('/api/admin/ads', {
          method: 'POST',
          body: formDataToSend,
        })
      }

      if (response.ok) {
        setDialogOpen(false)
        fetchAds()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save ad')
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      alert('Failed to save ad')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return
    }

    try {
      const response = await apiRequest(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAds()
      } else {
        alert('Failed to delete ad')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('Failed to delete ad')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ads Management</h1>
          <p className="text-gray-600 mt-1">Manage advertisements displayed on the platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAd ? 'Edit Ad' : 'Add New Ad'}</DialogTitle>
              <DialogDescription>
                Upload an ad image and provide a link. The ad will be displayed on the frontend.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Ad Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="relative mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain border rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                        setFormData({ ...formData, image: '' })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link URL *</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">Lower numbers appear first</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-full">
                  {submitting ? 'Saving...' : editingAd ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>All Ads</CardTitle>
          <CardDescription>Manage all advertisements</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ads found</p>
              <p className="text-sm text-gray-400 mt-2">Click "Add New Ad" to create your first ad</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id || ad._id}>
                    <TableCell>
                      {ad.image ? (
                        <img
                          src={ad.image}
                          alt="Ad"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {ad.link}
                      </a>
                    </TableCell>
                    <TableCell>{ad.order || 0}</TableCell>
                    <TableCell>
                      {ad.isActive ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(ad)}
                          className="rounded-full"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ad.id || ad._id!)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
