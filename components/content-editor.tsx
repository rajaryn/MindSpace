"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bold, Italic, List, Link, ImageIcon, Save, Send } from "lucide-react"

interface ContentEditorProps {
  resourceId?: number
  onSave?: (content: any) => void
  onCancel?: () => void
}

export function ContentEditor({ resourceId, onSave, onCancel }: ContentEditorProps) {
  const [content, setContent] = useState({
    title: "",
    category: "",
    tags: "",
    body: "",
    summary: "",
    featured: false,
    scheduled: "",
    status: "draft",
  })

  const [activeTab, setActiveTab] = useState("edit")

  const handleSave = (status: "draft" | "review" | "published") => {
    const updatedContent = { ...content, status }
    console.log(`[v0] Saving content with status: ${status}`, updatedContent)
    onSave?.(updatedContent)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/70 backdrop-blur-sm border-emerald-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-emerald-900">{resourceId ? "Edit Content" : "Create New Content"}</CardTitle>
            <CardDescription>Create and manage mental health resources with rich formatting</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave("draft")}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave("review")} className="">
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="Enter content title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={content.category} onValueChange={(value) => setContent({ ...content, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mental-health">Mental Health</SelectItem>
                    <SelectItem value="self-help">Self-Help</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={content.summary}
                onChange={(e) => setContent({ ...content, summary: e.target.value })}
                placeholder="Brief summary of the content"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={content.tags}
                onChange={(e) => setContent({ ...content, tags: e.target.value })}
                placeholder="anxiety, depression, coping, therapy"
              />
            </div>

            {/* Rich Text Editor Toolbar */}
            <div className="border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
                <Button size="sm" variant="ghost">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <List className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Link className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={content.body}
                onChange={(e) => setContent({ ...content, body: e.target.value })}
                placeholder="Write your content here. Use markdown for formatting..."
                rows={12}
                className="border-0 resize-none focus:ring-0"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold text-emerald-900 mb-2">{content.title || "Content Title"}</h1>
              {content.summary && <p className="text-gray-600 italic mb-4">{content.summary}</p>}
              {content.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.tags.split(",").map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap text-gray-800">{content.body || "Content will appear here..."}</div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={content.featured}
                    onCheckedChange={(checked) => setContent({ ...content, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured content</Label>
                </div>

                <div>
                  <Label htmlFor="scheduled">Schedule Publication</Label>
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={content.scheduled}
                    onChange={(e) => setContent({ ...content, scheduled: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Content Status</Label>
                  <Select value={content.status} onValueChange={(value) => setContent({ ...content, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-medium text-emerald-900 mb-2">Content Guidelines</h4>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• Use clear, accessible language</li>
                    <li>• Include trigger warnings when appropriate</li>
                    <li>• Provide actionable advice and resources</li>
                    <li>• Maintain professional, supportive tone</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
