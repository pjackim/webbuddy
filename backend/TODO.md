I need help fixing this project. When I run `uv run debug` (or run anything, even `pytest`), things seems to break (such as literally not working, freezing in the CLI, and be unable to escape the CLI via CTRL+C). When I run `uv run debug` I get a clean log like:

```
> uv run debug
INFO:     Will watch for changes in these directories: ['Z:\\Coding\\webbuddy\\webbuddy\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [117160] using WatchFiles
```

But `http://0.0.0.0:8000` is not accessible and I am unable to CTRL+C out of the running server. When running things like `pytest`, the CLI freezes entirely! Please carefully review the code and fix these issues. 
