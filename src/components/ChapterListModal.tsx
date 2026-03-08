import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Chapter } from "@/data/mockManga";

interface ChapterListModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  mangaSlug: string;
  mangaCover: string;
  currentChapterNumber?: number;
}

const ChapterListModal = ({
  isOpen,
  onClose,
  chapters,
  mangaSlug,
  mangaCover,
  currentChapterNumber,
}: ChapterListModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chapter List ({chapters.length} chapters)</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => {
                  onClose();
                  navigate(`/manga/${mangaSlug}/chapter/${chapter.number}`);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border group ${
                  currentChapterNumber === chapter.number
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-secondary/30 hover:bg-secondary/60 border-transparent hover:border-primary/30"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`text-2xl font-bold transition-colors ${
                      currentChapterNumber === chapter.number
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                  >
                    {chapter.number}
                  </div>
                  <div className="text-left">
                    <h3
                      className={`font-medium transition-colors ${
                        currentChapterNumber === chapter.number
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {chapter.title || `Chapter ${chapter.number}`}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{chapter.date}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium rounded-xl px-3 py-1 ${
                    currentChapterNumber === chapter.number
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {currentChapterNumber === chapter.number ? "Current" : "Read"}
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterListModal;
