import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsPage() {
  const { signOut } = useAuth();
  const theme = useSettingsStore(s => s.theme);
  const sound = useSettingsStore(s => s.sound);
  const setTheme = useSettingsStore(s => s.setTheme);
  const setSound = useSettingsStore(s => s.setSound);
  return (
    <div className="pt-16 px-4 text-white">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-2xl font-bold">Settings</div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/80 mb-2">Account</div>
          <Button variant="outline" className="border-white/20" onClick={signOut}>Sign Out</Button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="text-white/80">Preferences</div>
          <div className="flex items-center justify-between">
            <div>Theme</div>
            <div className="flex gap-2">
              <button onClick={() => setTheme('dark')} className={`px-3 py-1 rounded ${theme==='dark'?'bg-white text-black':'bg-white/10'}`}>Dark</button>
              <button onClick={() => setTheme('light')} className={`px-3 py-1 rounded ${theme==='light'?'bg-white text-black':'bg-white/10'}`}>Light</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Sound Effects</div>
            <button onClick={() => setSound(!sound)} className={`px-3 py-1 rounded ${sound?'bg-white text-black':'bg-white/10'}`}>{sound?'On':'Off'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


