/**
 * Deno Deploy 视频/图片下载代理
 * 部署: deployctl deploy --project=douyin-proxy --entrypoint=main.ts
 */

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // 健康检查
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ status: "ok", time: Date.now() }), {
      headers: { "content-type": "application/json" },
    })
  }

  // 代理下载: /proxy?url=https://xxx.mp4
  const targetUrl = url.searchParams.get("url")
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "缺少 url 参数" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  // 安全校验：只允许 http/https
  if (!/^https?:\/\//.test(targetUrl)) {
    return new Response(JSON.stringify({ error: "链接格式无效" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": new URL(targetUrl).origin,
      },
      redirect: "follow",
    })

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `下载失败: HTTP ${resp.status}` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      })
    }

    // 透传响应头，流式返回
    const headers = new Headers()
    const contentType = resp.headers.get("content-type")
    const contentLength = resp.headers.get("content-length")
    if (contentType) headers.set("content-type", contentType)
    if (contentLength) headers.set("content-length", contentLength)
    headers.set("cache-control", "public, max-age=3600")

    return new Response(resp.body, {
      status: 200,
      headers,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: "代理请求失败" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    })
  }
})
