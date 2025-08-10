def main():
    import uvicorn

    # Uses factory, matching your previous CLI usage
    uvicorn.run(
        "app.main:create_app", factory=True, host="0.0.0.0", port=8000, reload=False
    )
