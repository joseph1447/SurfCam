'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle, Video, Youtube } from 'lucide-react';

interface ClipResult {
  success: boolean;
  reason?: string;
  error?: string;
  clip?: {
    id: string;
    title: string;
    url: string;
    duration: number;
    videoUrl: string;
  };
  youtube?: {
    success: boolean;
    videoId: string;
    youtubeUrl: string;
    title: string;
  };
  timestamp?: string;
}

export default function CreateClipPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClipResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleCreateClip = async () => {
    setIsLoading(true);
    setResult(null);
    setLogs([]);

    addLog('Starting clip creation workflow...');

    try {
      addLog('Calling /api/create-clip...');

      const response = await fetch('/api/create-clip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ClipResult = await response.json();
      setResult(data);

      if (data.success) {
        addLog(`Clip created: ${data.clip?.title}`);
        addLog(`Twitch URL: ${data.clip?.url}`);
        if (data.youtube?.success) {
          addLog(`YouTube upload successful!`);
          addLog(`YouTube URL: ${data.youtube.youtubeUrl}`);
        }
      } else if (data.reason) {
        addLog(`Skipped: ${data.reason}`);
      } else {
        addLog(`Error: ${data.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Failed: ${errorMessage}`);
      setResult({ success: false, error: errorMessage });
    } finally {
      setIsLoading(false);
      addLog('Workflow completed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Video className="w-6 h-6" />
              Create Clip & Upload to YouTube
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manually trigger the workflow to create a Twitch clip and upload it to YouTube Shorts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-300 text-sm">
              <strong>Requirements:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Stream must be LIVE on Twitch</li>
                <li>TWITCH_BROADCASTER_ID must be configured</li>
                <li>YouTube OAuth must be set up</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateClip}
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing... (this takes ~20 seconds)
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Create Clip & Upload
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        {logs.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-600/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-slate-300 text-sm">Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="text-slate-400">{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className={`backdrop-blur border ${
            result.success
              ? 'bg-green-900/20 border-green-500/30'
              : result.reason
                ? 'bg-yellow-900/20 border-yellow-500/30'
                : 'bg-red-900/20 border-red-500/30'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                result.success ? 'text-green-400' : result.reason ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {result.success ? (
                  <><CheckCircle className="w-5 h-5" /> Success!</>
                ) : result.reason ? (
                  <><XCircle className="w-5 h-5" /> Skipped</>
                ) : (
                  <><XCircle className="w-5 h-5" /> Error</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.reason && (
                <p className="text-yellow-300">{result.reason}</p>
              )}

              {result.error && (
                <p className="text-red-300">{result.error}</p>
              )}

              {result.clip && (
                <div className="space-y-2">
                  <h4 className="text-cyan-400 font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4" /> Twitch Clip
                  </h4>
                  <div className="bg-slate-800 rounded p-3 space-y-1 text-sm">
                    <p className="text-white">{result.clip.title}</p>
                    <p className="text-slate-400">Duration: {result.clip.duration}s</p>
                    <a
                      href={result.clip.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline block"
                    >
                      View on Twitch →
                    </a>
                  </div>
                </div>
              )}

              {result.youtube?.success && (
                <div className="space-y-2">
                  <h4 className="text-red-400 font-semibold flex items-center gap-2">
                    <Youtube className="w-4 h-4" /> YouTube Short
                  </h4>
                  <div className="bg-slate-800 rounded p-3 space-y-1 text-sm">
                    <p className="text-white">{result.youtube.title}</p>
                    <a
                      href={result.youtube.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:underline block"
                    >
                      View on YouTube →
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-slate-500 text-sm">
          This page is for testing only. In production, clips are created automatically via cron jobs.
        </p>
      </div>
    </div>
  );
}
