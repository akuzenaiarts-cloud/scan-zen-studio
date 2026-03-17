import { useState, useEffect } from 'react';
import {
  Database, ChevronDown, ChevronUp, BookOpen, Info, AlertTriangle, ExternalLink, HardDrive, BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface StorageSectionProps {
  settingsForm: {
    storage_provider: string;
    blogger_blog_id: string;
    blogger_api_key: string;
  };
  setSettingsForm: React.Dispatch<React.SetStateAction<any>>;
}

export function StorageSection({ settingsForm, setSettingsForm }: StorageSectionProps) {
  const [bloggerTutorialOpen, setBloggerTutorialOpen] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{ total_mb: number; total_files: number } | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);

  useEffect(() => {
    fetchStorageUsage();
  }, []);

  const fetchStorageUsage = async () => {
    setStorageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('storage-usage');
      if (!error && data) {
        setStorageUsage(data);
      }
    } catch {
      // silently fail
    }
    setStorageLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Storage Usage Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Supabase Storage</p>
              <p className="text-[10px] text-muted-foreground">manga-assets bucket</p>
            </div>
          </div>
          {storageLoading ? (
            <div className="animate-pulse h-6 bg-muted rounded w-24" />
          ) : storageUsage ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {storageUsage.total_mb >= 1024
                    ? `${(storageUsage.total_mb / 1024).toFixed(2)} GB`
                    : `${storageUsage.total_mb} MB`}
                </span>
                <span className="text-xs text-muted-foreground">used</span>
              </div>
              <p className="text-xs text-muted-foreground">{storageUsage.total_files.toLocaleString()} files</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (storageUsage.total_mb / 1024) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Free plan: 1 GB • Pro plan: 100 GB</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Unable to fetch usage data</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Blogger CDN</p>
              <p className="text-[10px] text-muted-foreground">Google's free image hosting</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">∞</span>
              <span className="text-xs text-muted-foreground">unlimited</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {settingsForm.storage_provider === 'blogger' && settingsForm.blogger_blog_id
                ? 'Configured & Active'
                : 'Not configured'}
            </p>
            <p className="text-[10px] text-muted-foreground">Usage tracking not available for Blogger CDN</p>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Database className="w-4 h-4" /> Storage Provider</h3>
        <p className="text-sm text-muted-foreground">
          Choose where to store uploaded images. Blogger uses Google's CDN for free unlimited image hosting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'supabase', label: 'Supabase Storage', desc: 'Default storage (limited by plan)' },
            { id: 'blogger', label: 'Blogger CDN', desc: 'Free unlimited via Google CDN' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSettingsForm((s: any) => ({ ...s, storage_provider: opt.id }))}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                settingsForm.storage_provider === opt.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>

        {settingsForm.storage_provider === 'blogger' && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div>
              <label className="text-sm font-medium mb-1 block">Blog ID</label>
              <Input
                value={settingsForm.blogger_blog_id}
                onChange={e => setSettingsForm((s: any) => ({ ...s, blogger_blog_id: e.target.value }))}
                className="rounded-xl bg-background font-mono text-xs"
                placeholder="e.g. 1234567890123456789"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">OAuth Access Token</label>
              <Input
                type="password"
                value={settingsForm.blogger_api_key}
                onChange={e => setSettingsForm((s: any) => ({ ...s, blogger_api_key: e.target.value }))}
                className="rounded-xl bg-background font-mono text-xs"
                placeholder="ya29.a0..."
              />
              <p className="text-[10px] text-muted-foreground mt-1">This is an OAuth 2.0 access token, NOT an API key.</p>
            </div>

            {/* Tutorial Toggle */}
            <button
              onClick={() => setBloggerTutorialOpen(!bloggerTutorialOpen)}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium mt-1 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              How to set up Blogger storage
              {bloggerTutorialOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {bloggerTutorialOpen && (
              <div className="bg-muted/30 rounded-xl p-4 space-y-3 text-sm text-muted-foreground border border-border/40">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Blogger CDN Setup Guide</p>

                <div className="space-y-2">
                  <p className="font-medium text-foreground text-xs">Step 1: Create a Google Cloud Project</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener" className="text-primary underline">console.cloud.google.com</a></li>
                    <li>Click <strong>"Select a project"</strong> → <strong>"New Project"</strong></li>
                    <li>Name it (e.g., "Manga CDN") and click <strong>Create</strong></li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-foreground text-xs">Step 2: Enable the Blogger API</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
                    <li>In your new project, go to <strong>APIs & Services → Library</strong></li>
                    <li>Search for <strong>"Blogger API v3"</strong></li>
                    <li>Click on it and press <strong>"Enable"</strong></li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-foreground text-xs">Step 3: Create OAuth 2.0 Credentials</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
                    <li>Go to <strong>APIs & Services → Credentials</strong></li>
                    <li>Click <strong>"+ Create Credentials" → "OAuth client ID"</strong></li>
                    <li>If prompted, configure the <strong>OAuth consent screen</strong> first (select "External", fill in app name and email)</li>
                    <li>Application type: <strong>"Web application"</strong></li>
                    <li>Add <code className="bg-muted px-1 rounded">https://developers.google.com/oauthplayground</code> as an <strong>Authorized redirect URI</strong></li>
                    <li>Click <strong>Create</strong> and note the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-foreground text-xs">Step 4: Create a Blogger Blog</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
                    <li>Go to <a href="https://www.blogger.com" target="_blank" rel="noopener" className="text-primary underline">blogger.com</a> and sign in</li>
                    <li>Click <strong>"Create New Blog"</strong></li>
                    <li>Name it anything (e.g., "CDN Storage") — it won't be public</li>
                    <li>After creation, go to the blog's URL. The <strong>Blog ID</strong> is in the URL:
                      <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] block mt-1 break-all">
                        https://www.blogger.com/blog/posts/1234567890123456789
                      </code>
                      The number is your Blog ID.
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-foreground text-xs">Step 5: Generate an Access Token</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs pl-2">
                    <li>Go to <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener" className="text-primary underline">OAuth 2.0 Playground</a></li>
                    <li>Click the ⚙️ gear icon → check <strong>"Use your own OAuth credentials"</strong></li>
                    <li>Enter your <strong>Client ID</strong> and <strong>Client Secret</strong> from Step 3</li>
                    <li>In the left panel, scroll to <strong>"Blogger API v3"</strong> and select <code className="bg-muted px-1 rounded">https://www.googleapis.com/auth/blogger</code></li>
                    <li>Click <strong>"Authorize APIs"</strong> → Sign in → Allow</li>
                    <li>Click <strong>"Exchange authorization code for tokens"</strong></li>
                    <li>Copy the <strong>Access Token</strong> and paste it above</li>
                  </ol>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                    <p><strong>Important:</strong> OAuth access tokens expire after ~1 hour. For long-term use, use the <strong>Refresh Token</strong> (also shown in the Playground) to auto-refresh.</p>
                    <p>For production, consider using a service account or setting up a refresh token flow.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg">
                  <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs">
                    <strong>How it works:</strong> When uploading chapter images, the system creates a temporary Blogger post with the image embedded. Blogger converts it to a Google CDN URL. The post is then deleted, but the image remains on Google's CDN permanently and for free.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
