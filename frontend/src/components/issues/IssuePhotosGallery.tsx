import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface IssuePhotosGalleryProps {
  photos: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
  onAddPhoto: (photo: { id: string; url: string; uploadedAt: string }) => void;
}

export function IssuePhotosGallery({ photos, onAddPhoto }: IssuePhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddPhoto({
          id: `photo-${Date.now()}`,
          url: reader.result as string,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Issue Photos
              </CardTitle>
              <CardDescription>
                Visual documentation of the issue
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div 
                  key={photo.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <img 
                    src={photo.url} 
                    alt={`Issue photo`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No photos uploaded yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload photos to document the issue
              </p>
              <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Photo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <img 
              src={selectedPhoto} 
              alt="Full size preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
