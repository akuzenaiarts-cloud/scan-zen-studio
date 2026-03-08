import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAdminChapters,
  useCreateChapter,
  useDeleteChapter,
  useUpdateChapter,
} from "@/hooks/useManga";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, Plus, Trash2, Edit, FileImage } from "lucide-react";
import { toast } from "sonner";

type Manga = Tables<"manga">;
type Chapter = Tables<"chapters">;

interface ChapterManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manga: Manga | null;
}

export const ChapterManager = ({ open, onOpenChange, manga }: ChapterManagerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [pageFiles, setPageFiles] = useState<FileList | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);

  const { data: chapters = [], isLoading } = useAdminChapters(manga?.id || null);
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();

  const resetForm = () => {
    setChapterNumber("");
    setChapterTitle("");
    setIsPremium(false);
    setPageFiles(null);
    setShowAddForm(false);
    setEditingChapter(null);
  };

  const handleEditClick = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterNumber(chapter.number.toString());
    setChapterTitle(chapter.title);
    setIsPremium(chapter.premium || false);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manga) return;

    const num = parseFloat(chapterNumber);
    if (isNaN(num)) {
      toast.error("Chapter number must be a valid number");
      return;
    }

    if (!pageFiles || pageFiles.length === 0) {
      if (!editingChapter) {
        toast.error("Please select at least one page image");
        return;
      }
    }

    const files = pageFiles ? Array.from(pageFiles) : [];

    try {
      if (editingChapter) {
        await updateChapter.mutateAsync({
          id: editingChapter.id,
          mangaId: manga.id,
          chapter: {
            number: num,
            title: chapterTitle,
            premium: isPremium,
          },
          pageFiles: files.length > 0 ? files : undefined,
          mangaSlug: manga.slug,
          oldPages: editingChapter.pages || undefined,
        });
      } else {
        await createChapter.mutateAsync({
          chapter: {
            manga_id: manga.id,
            number: num,
            title: chapterTitle,
            premium: isPremium,
          },
          pageFiles: files,
          mangaSlug: manga.slug,
        });
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save chapter:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteChapterId) return;

    const chapter = chapters.find((c) => c.id === deleteChapterId);
    if (!chapter || !manga) return;

    await deleteChapter.mutateAsync({
      id: deleteChapterId,
      mangaId: manga.id,
      pages: chapter.pages || undefined,
    });

    setDeleteChapterId(null);
  };

  const isSaving = createChapter.isPending || updateChapter.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Chapters - {manga?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!showAddForm ? (
              <>
                <Button onClick={() => setShowAddForm(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Chapter
                </Button>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No chapters yet. Add your first chapter!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chapter #</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chapters.map((chapter) => (
                        <TableRow key={chapter.id}>
                          <TableCell>{chapter.number}</TableCell>
                          <TableCell>{chapter.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <FileImage className="h-4 w-4" />
                              {chapter.pages?.length || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            {chapter.premium ? "Yes" : "No"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(chapter)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteChapterId(chapter.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter-number">Chapter Number</Label>
                    <Input
                      id="chapter-number"
                      type="number"
                      step="0.1"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(e.target.value)}
                      placeholder="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chapter-title">Chapter Title</Label>
                    <Input
                      id="chapter-title"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      placeholder="The Beginning"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="premium">Premium Chapter</Label>
                  <Switch
                    id="premium"
                    checked={isPremium}
                    onCheckedChange={setIsPremium}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pages">
                    Page Images {editingChapter && "(Leave empty to keep existing pages)"}
                  </Label>
                  <Input
                    id="pages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPageFiles(e.target.files)}
                  />
                  {pageFiles && (
                    <p className="text-sm text-muted-foreground">
                      {pageFiles.length} file(s) selected
                    </p>
                  )}
                  {editingChapter && editingChapter.pages && (
                    <p className="text-sm text-muted-foreground">
                      Current: {editingChapter.pages.length} page(s)
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingChapter ? "Update Chapter" : "Create Chapter"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteChapterId} onOpenChange={() => setDeleteChapterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This will permanently delete
              all chapter pages and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
