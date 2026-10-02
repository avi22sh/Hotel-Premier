# ==============================================================================
# HOTEL PREMIER - LOCAL OFFLINE QR MENU SERVER
# Runs a zero-dependency local web server with LAN access & PWA support
# ==============================================================================

$port = 8080
$rootDir = $PSScriptRoot

# Detect Local LAN IPv4 for phone access over restaurant Wi-Fi
$lanIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | 
          Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.254\.' } | 
          Select-Object -ExpandProperty IPAddress -First 1)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "🏨 HOTEL PREMIER - PRIDE PURE VEG AC RESTAURANT & STAYS" -ForegroundColor Yellow
Write-Host "   Digital QR Menu & Live CMS Server" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Serving Folder: $rootDir" -ForegroundColor Gray
Write-Host "Local URL:      http://localhost:$port" -ForegroundColor Green
if ($lanIp) {
    Write-Host "Wi-Fi / LAN:    http://$($lanIp):$port  (Scan / open on mobile devices)" -ForegroundColor Cyan
}
Write-Host "Admin Studio:   http://localhost:$port/#admin  (PIN: admin123)" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server at any time.`n" -ForegroundColor Gray

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Net;
using System.Threading;

public class HotelPremierServer {
    private HttpListener listener;
    private string rootDir;
    private bool running = false;

    public HotelPremierServer(string root, int port) {
        rootDir = root;
        listener = new HttpListener();
        listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
        listener.Prefixes.Add("http://localhost:" + port + "/");
    }

    public void Start() {
        try {
            listener.Start();
            running = true;
            while (running) {
                try {
                    var context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem(ProcessRequest, context);
                } catch { }
            }
        } catch (Exception ex) {
            Console.WriteLine("[Error] Server failed to start: " + ex.Message);
        }
    }

    private void ProcessRequest(object state) {
        var context = (HttpListenerContext)state;
        try {
            string rawPath = context.Request.Url.AbsolutePath;
            if (rawPath == "/" || string.IsNullOrEmpty(rawPath)) rawPath = "/index.html";
            string filePath = Path.Combine(rootDir, rawPath.TrimStart('/').Replace('/', '\\'));

            if (File.Exists(filePath)) {
                string ext = Path.GetExtension(filePath).ToLower();
                string mime = "application/octet-stream";
                if (ext == ".html") mime = "text/html; charset=utf-8";
                else if (ext == ".css") mime = "text/css; charset=utf-8";
                else if (ext == ".js") mime = "application/javascript; charset=utf-8";
                else if (ext == ".json") mime = "application/json; charset=utf-8";
                else if (ext == ".png") mime = "image/png";
                else if (ext == ".jpg" || ext == ".jpeg" || ext == ".jfif") mime = "image/jpeg";
                else if (ext == ".avif") mime = "image/avif";
                else if (ext == ".webp") mime = "image/webp";
                else if (ext == ".svg") mime = "image/svg+xml";
                else if (ext == ".ico") mime = "image/x-icon";
                else if (ext == ".woff2") mime = "font/woff2";
                else if (ext == ".woff") mime = "font/woff";

                byte[] buf = File.ReadAllBytes(filePath);
                context.Response.ContentType = mime;
                context.Response.ContentLength64 = buf.Length;
                context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                context.Response.AddHeader("Cache-Control", "no-cache");
                if (context.Request.HttpMethod != "HEAD") {
                    context.Response.OutputStream.Write(buf, 0, buf.Length);
                }
            } else {
                context.Response.StatusCode = 404;
            }
        } catch { }
        finally {
            try { context.Response.OutputStream.Close(); } catch { }
        }
    }

    public void Stop() {
        running = false;
        try { listener.Stop(); } catch { }
    }
}
"@

# Launch browser after a short delay
Start-Process "http://localhost:$port"

$server = New-Object HotelPremierServer($rootDir, $port)
$server.Start()
