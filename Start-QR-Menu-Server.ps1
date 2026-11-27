# ==============================================================================
# HOTEL PREMIER - LOCAL OFFLINE QR MENU SERVER
# Runs a zero-dependency, loopback-only PWA preview and publishing service
# ==============================================================================

param([switch]$NoBrowser)
$port = 8080
$rootDir = $PSScriptRoot

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "🏨 HOTEL PREMIER - PRIDE PURE VEG AC RESTAURANT & STAYS" -ForegroundColor Yellow
Write-Host "   Digital QR Menu & Live CMS Server" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Serving Folder: $(Join-Path $rootDir 'dist')" -ForegroundColor Gray
Write-Host "Local URL:      http://localhost:$port" -ForegroundColor Green
Write-Host "Available on this PC only; hotel networking is unchanged." -ForegroundColor Gray
Write-Host "Admin Studio:   http://localhost:$port/#admin  (use your device's local PIN)" -ForegroundColor Yellow
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
    private string publicDir;
    private bool running = false;

    public HotelPremierServer(string root, int port) {
        rootDir = root;
        publicDir = Path.Combine(root, "dist");
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

            // Handle CORS preflight
            if (context.Request.HttpMethod == "OPTIONS") {
                context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                context.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                context.Response.StatusCode = 200;
                context.Response.OutputStream.Close();
                return;
            }

            // Handle 1-Click Live Publish API
            if (rawPath == "/api/publish-direct") {
                string origin = context.Request.Headers["Origin"];
                string[] publishOrigins = { "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:8765", "https://avi22sh.github.io" };
                if (!String.IsNullOrEmpty(origin) && Array.IndexOf(publishOrigins, origin) < 0) {
                    context.Response.StatusCode = 403;
                    context.Response.OutputStream.Close();
                    return;
                }
                if (!String.IsNullOrEmpty(origin)) context.Response.AddHeader("Access-Control-Allow-Origin", origin);
                context.Response.ContentType = "application/json; charset=utf-8";

                if (context.Request.HttpMethod == "POST") {
                    try {
                        string body;
                        using (var reader = new StreamReader(context.Request.InputStream, System.Text.Encoding.UTF8, true)) {
                            body = reader.ReadToEnd();
                        }

                        string tempFile = Path.Combine(rootDir, "tools", "temp-bundle-" + Guid.NewGuid().ToString("N") + ".json");
                        File.WriteAllText(tempFile, body, System.Text.Encoding.UTF8);

                        string scriptPath = Path.Combine(rootDir, "tools", "publish-direct.ps1");
                        string resultFile = tempFile + ".result.json";
                        var startInfo = new System.Diagnostics.ProcessStartInfo {
                            FileName = "powershell.exe",
                            Arguments = "-ExecutionPolicy Bypass -NoProfile -File \"" + scriptPath + "\" -InputFile \"" + tempFile + "\" -ResultFile \"" + resultFile + "\"",
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true,
                            WorkingDirectory = rootDir
                        };

                        using (var process = System.Diagnostics.Process.Start(startInfo)) {
                            var outputTask = process.StandardOutput.ReadToEndAsync();
                            var errorTask = process.StandardError.ReadToEndAsync();
                            if (!process.WaitForExit(90000)) {
                                try { process.Kill(); } catch { }
                                throw new TimeoutException("Publishing took too long. Your edits remain saved; check the live site before retrying.");
                            }
                            string output = File.Exists(resultFile) ? File.ReadAllText(resultFile, System.Text.Encoding.UTF8) : "";

                            try { if (File.Exists(tempFile)) File.Delete(tempFile); } catch { }
                            try { if (File.Exists(resultFile)) File.Delete(resultFile); } catch { }

                            if (!string.IsNullOrWhiteSpace(output)) {
                                byte[] resBytes = System.Text.Encoding.UTF8.GetBytes(output.Trim());
                                context.Response.StatusCode = process.ExitCode == 0 ? 200 : 500;
                                context.Response.OutputStream.Write(resBytes, 0, resBytes.Length);
                            } else {
                                context.Response.StatusCode = 500;
                                string errJson = "{\"success\":false,\"error\":\"The publishing helper did not return a result. Your edits remain saved; check the live site before retrying.\"}";
                                byte[] errBytes = System.Text.Encoding.UTF8.GetBytes(errJson);
                                context.Response.OutputStream.Write(errBytes, 0, errBytes.Length);
                            }
                        }
                    } catch (Exception ex) {
                        context.Response.StatusCode = 500;
                        string exJson = "{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}";
                        byte[] errBytes = System.Text.Encoding.UTF8.GetBytes(exJson);
                        context.Response.OutputStream.Write(errBytes, 0, errBytes.Length);
                    }
                } else {
                    string statusJson = "{\"status\":\"ready\",\"endpoint\":\"/api/publish-direct\"}";
                    byte[] statusBytes = System.Text.Encoding.UTF8.GetBytes(statusJson);
                    context.Response.StatusCode = 200;
                    context.Response.OutputStream.Write(statusBytes, 0, statusBytes.Length);
                }
                context.Response.OutputStream.Close();
                return;
            }

            if (rawPath == "/" || string.IsNullOrEmpty(rawPath)) rawPath = "/index.html";
            string filePath = Path.GetFullPath(Path.Combine(publicDir, Uri.UnescapeDataString(rawPath).TrimStart('/').Replace('/', '\\')));
            if (!filePath.StartsWith(Path.GetFullPath(publicDir) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) {
                context.Response.StatusCode = 403;
                return;
            }

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
if (-not $NoBrowser) { Start-Process "http://localhost:$port" }

$server = New-Object HotelPremierServer($rootDir, $port)
$server.Start()
