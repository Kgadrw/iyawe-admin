'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiRequest, API_ENDPOINTS } from '@/lib/api'
import {
  AD_PLACEMENT_LABELS,
  BANNER_TOP_MAX_ACTIVE,
  type AdPlacement,
} from '@/lib/ads'
import { Megaphone, Plus, Edit, Trash2, CheckCircle, XCircle, X, ExternalLink, LayoutPanelTop, PanelRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Ad {
  id: string
  title?: string
  description?: string
  image: string
  link: string
  isActive: boolean
  order: number
  placement: AdPlacement
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    order: '0',
    isActive: true,
    placement: 'SIDEBAR_RIGHT' as AdPlacement,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const bannerActiveCount = useMemo(
    () =>
      ads.filter(
        (a) => a.placement === 'BANNER_TOP' && a.isActive && a.id !== editingAd?.id
      ).length,
    [ads, editingAd?.id]
  )

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(API_ENDPOINTS.adminAds)
      if (response.ok) {
        const data = await response.json()
        setAds(
          (data.ads || []).map((a: Ad & { placement?: string }) => ({
            ...a,
            placement:
              a.placement === 'BANNER_TOP' || a.placement === 'SIDEBAR_RIGHT'
                ? a.placement
                : 'SIDEBAR_RIGHT',
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad)
      setFormData({
        title: ad.title || '',
        link: ad.link || '',
        order: String(ad.order ?? 0),
        isActive: ad.isActive,
        placement: ad.placement || 'SIDEBAR_RIGHT',
      })
      setImagePreview(ad.image || null)
      setImageFile(null)
    } else {
      setEditingAd(null)
      setFormData({
        title: '',
        link: '',
        order: '0',
        isActive: true,
        placement: 'SIDEBAR_RIGHT',
      })
      setImagePreview(null)
      setImageFile(null)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingAd(null)
    setFormData({
      title: '',
      link: '',
      order: '0',
      isActive: true,
      placement: 'SIDEBAR_RIGHT',
    })
    setImagePreview(null)
    setImageFile(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAd && !imageFile && !imagePreview) {
      alert('Please upload an ad image')
      return
    }
    if (!formData.link.trim()) {
      alert('Please enter a link URL')
      return
    }

    if (
      formData.placement === 'BANNER_TOP' &&
      formData.isActive &&
      bannerActiveCount >= BANNER_TOP_MAX_ACTIVE
    ) {
      alert(`Only ${BANNER_TOP_MAX_ACTIVE} active ads can use the below-header placement.`)
      return
    }

    setSubmitting(true)
    try {
      const url = editingAd ? API_ENDPOINTS.adminAd(editingAd.id) : API_ENDPOINTS.adminAds
      const method = editingAd ? 'PUT' : 'POST'

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('link', formData.link)
      formDataToSend.append('order', formData.order)
      formDataToSend.append('isActive', String(formData.isActive))
      formDataToSend.append('placement', formData.placement)
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      const response = await apiRequest(url, {
        method,
        body: formDataToSend,
      })

      if (response.ok) {
        await fetchAds()
        handleCloseDialog()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save ad')
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      alert('An error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return
    try {
      const response = await apiRequest(API_ENDPOINTS.adminAd(id), { method: 'DELETE' })
      if (response.ok) {
        await fetchAds()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete ad')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('An error occurred while deleting')
    }
  }

  const toggleActive = async (ad: Ad) => {
    if (ad.placement === 'BANNER_TOP' && !ad.isActive) {
      const count = ads.filter((a) => a.placement === 'BANNER_TOP' && a.isActive).length
      if (count >= BANNER_TOP_MAX_ACTIVE) {
        alert(`Only ${BANNER_TOP_MAX_ACTIVE} active banner ads allowed below the header.`)
        return
      }
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('link', ad.link)
      formDataToSend.append('order', String(ad.order))
      formDataToSend.append('isActive', String(!ad.isActive))
      formDataToSend.append('placement', ad.placement)
      if (ad.title) formDataToSend.append('title', ad.title)

      const response = await apiRequest(API_ENDPOINTS.adminAd(ad.id), {
        method: 'PUT',
        body: formDataToSend,
      })
      if (response.ok) await fetchAds()
      else {
        const data = await response.json()
        alert(data.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error toggling ad status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="platform-section-title flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-gold-400" />
            Advertisements
          </h1>
          <p className="platform-section-desc mt-1">
            Choose where each ad appears: two small horizontal banners below the header, or vertical ads in the right sidebar.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingAd ? 'Edit ad' : 'New ad'}
              </DialogTitle>
              <DialogDescription>
                Pick placement on the homepage, then upload a wide image for banners or a taller image for the sidebar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-blue-900">Placement *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {(['BANNER_TOP', 'SIDEBAR_RIGHT'] as const).map((p) => (
                    <label
                      key={p}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        formData.placement === p
                          ? 'border-blue-900 bg-blue-50/80'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="placement"
                        value={p}
                        checked={formData.placement === p}
                        onChange={() => setFormData({ ...formData, placement: p })}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-blue-900">
                          {p === 'BANNER_TOP' ? (
                            <LayoutPanelTop className="h-4 w-4 text-gold-500" />
                          ) : (
                            <PanelRight className="h-4 w-4 text-gold-500" />
                          )}
                          {AD_PLACEMENT_LABELS[p]}
                        </span>
                        <p className="text-xs text-blue-900/60 mt-0.5">
                          {p === 'BANNER_TOP'
                            ? `Wide rectangle below header. Max ${BANNER_TOP_MAX_ACTIVE} active (${bannerActiveCount}/${BANNER_TOP_MAX_ACTIVE} used).`
                            : 'Stacked on the right on desktop; below the feed on mobile.'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-blue-900">
                  Title (optional)
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-xl text-blue-900"
                  placeholder="For accessibility"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link" className="text-blue-900">
                  Link URL *
                </Label>
                <Input
                  id="link"
                  type="url"
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="rounded-xl text-blue-900"
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order" className="text-blue-900">
                  Display order
                </Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="rounded-xl text-blue-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer text-blue-900">
                  Active (visible on homepage)
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-blue-900">
                  Image {editingAd ? '(leave empty to keep current)' : '*'}
                  {formData.placement === 'BANNER_TOP' ? (
                    <span className="font-normal text-blue-900/60"> — use a wide banner (~3:1)</span>
                  ) : null}
                </Label>
                {imagePreview ? (
                  <div className="relative inline-block max-w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={`rounded-lg border object-contain max-w-full ${
                        formData.placement === 'BANNER_TOP'
                          ? 'h-20 w-full max-w-md'
                          : 'max-h-40'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                >
                  {submitting ? 'Saving...' : editingAd ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="platform-stat-card">
          <p className="text-xs text-blue-900/60 font-medium">Below header (banner)</p>
          <p className="text-2xl font-bold text-blue-900 tabular-nums">
            {ads.filter((a) => a.placement === 'BANNER_TOP' && a.isActive).length} / {BANNER_TOP_MAX_ACTIVE}
          </p>
          <p className="text-xs text-blue-900/50 mt-1">Active horizontal slots</p>
        </div>
        <div className="platform-stat-card">
          <p className="text-xs text-blue-900/60 font-medium">Right sidebar</p>
          <p className="text-2xl font-bold text-blue-900 tabular-nums">
            {ads.filter((a) => a.placement === 'SIDEBAR_RIGHT' && a.isActive).length}
          </p>
          <p className="text-xs text-blue-900/50 mt-1">Active vertical ads</p>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="platform-panel p-12 text-center">
          <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-blue-900 font-medium">No ads yet</p>
          <p className="text-sm text-blue-900/60 mt-1">Create ads and assign them to a placement</p>
        </div>
      ) : (
        <div className="platform-panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Preview</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id} className="hover:bg-blue-50/30">
                  <TableCell>
                    {ad.image ? (
                      <img
                        src={ad.image}
                        alt={ad.title || 'Ad'}
                        className={`object-cover rounded border ${
                          ad.placement === 'BANNER_TOP'
                            ? 'h-10 w-28'
                            : 'h-14 w-20'
                        }`}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-900 bg-gray-100 px-2 py-1 rounded-full">
                      {ad.placement === 'BANNER_TOP' ? (
                        <LayoutPanelTop className="h-3 w-3" />
                      ) : (
                        <PanelRight className="h-3 w-3" />
                      )}
                      {ad.placement === 'BANNER_TOP' ? 'Header' : 'Sidebar'}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-blue-900">{ad.title || '—'}</TableCell>
                  <TableCell>
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline text-sm flex items-center gap-1 max-w-[160px] truncate"
                    >
                      {ad.link}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>{ad.order}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleActive(ad)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ad.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Inactive
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleOpenDialog(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-red-600"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
