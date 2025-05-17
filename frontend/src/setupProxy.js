const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api", // Only proxy requests that start with /api
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      secure: false,
      xfwd: true,
      // No path rewrite to ensure /api/v1 is preserved
      onProxyReq: (proxyReq, req, res) => {
        // For multipart/form-data, don't attempt to parse the body
        if (
          req.headers["content-type"] &&
          req.headers["content-type"].includes("multipart/form-data")
        ) {
          console.log(
            "Proxying multipart request:",
            req.method,
            req.url,
            "→",
            proxyReq.path
          );
          return;
        }

        // Log proxy requests for debugging
        console.log("Proxying:", req.method, req.url, "→", proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            success: false,
            message: "Backend server is not available. Please try again later.",
          })
        );
      },
      logLevel: "debug",
    })
  );
};
