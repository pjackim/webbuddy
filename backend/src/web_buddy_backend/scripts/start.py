def main():
    import os

    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))

    print(f"Starting server on http://localhost:{port} (bound to {host})")

    # Uses factory, matching your previous CLI usage
    uvicorn.run(
        "web_buddy_backend.main:create_app",
        factory=True,
        host=host,
        port=port,
        reload=False,
    )
