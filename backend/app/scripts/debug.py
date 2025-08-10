def main():
    import uvicorn

    uvicorn.run(
        "app.main:create_app", factory=True, host="0.0.0.0", port=8000, reload=True
    )
