// Deno Deploy 抖音视频代理服务（适配微信小程序）
Deno.serve(async (request: Request) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    // 透传视频流和响应头
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Proxy failed", { status: 500 });
  }
});
