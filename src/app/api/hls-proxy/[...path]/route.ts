import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const baseUrl = 'http://20.38.46.18/hls';
  
  // Reconstruct the path from the dynamic route segments
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const targetUrl = `${baseUrl}/${path}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    // Handle different content types appropriately
    if (path.endsWith('.m3u8')) {
      // For manifest files, treat as text
      const content = await response.text();

      // For HLS manifests, we need to rewrite the URLs to go through our proxy
      let processedContent = content;
      
      // Replace absolute URLs in the manifest to go through our proxy
      processedContent = content.replace(
        /(https?:\/\/[^\/]+)\/hls\//g,
        `${request.nextUrl.origin}/api/hls-proxy/`
      );
      
      // Also replace relative segment URLs to go through our proxy
      processedContent = processedContent.replace(
        /^([^#\n]*\.ts)$/gm,
        (match, segmentUrl) => {
          // If it's already an absolute URL, don't change it
          if (segmentUrl.startsWith('http')) {
            return match;
          }
          // Make relative URLs go through our proxy
          return `${request.nextUrl.origin}/api/hls-proxy/${segmentUrl}`;
        }
      );
      
      return new NextResponse(processedContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
          'Cache-Control': 'no-cache',
          'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
        },
      });
         } else {
       // For segment files (.ts), treat as binary data
       const arrayBuffer = await response.arrayBuffer();
      
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp2t',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
          'Cache-Control': 'no-cache',
          'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
        },
      });
    }


  } catch (error) {
    console.error('HLS Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch the HLS resource' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
    },
  });
}
