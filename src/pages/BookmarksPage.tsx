import { useContentStore } from '@/store/contentStore';

export default function BookmarksPage() {
  const { getSavedContent } = useContentStore();
  const saved = getSavedContent();

  return (
    <div className="pt-16 px-4 text-white">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-2xl font-bold">Bookmarks</div>
        <div className="grid gap-3">
          {saved.length === 0 && (
            <div className="text-white/60">No bookmarks yet.</div>
          )}
          {saved.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-lg font-semibold">{item.title}</div>
              <div className="text-white/60 text-sm">{item.subject} • {item.difficulty_level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


