"""
Test fixtures and utilities for media upload tests.
"""
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from web_buddy_backend.main import app
import cv2
import numpy as np

@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)

@pytest.fixture
def temp_upload_dir():
    """Temporary directory for test uploads."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)

def create_test_image(width: int = 100, height: int = 100, format: str = "png") -> bytes:
    """Create a test image in memory."""
    # Create a simple test image with OpenCV
    img = np.zeros((height, width, 3), dtype=np.uint8)
    # Add some content (diagonal line)
    cv2.line(img, (0, 0), (width, height), (255, 255, 255), 2)
    
    # Encode to bytes
    if format.lower() == "png":
        _, encoded = cv2.imencode('.png', img)
    elif format.lower() in ["jpg", "jpeg"]:
        _, encoded = cv2.imencode('.jpg', img)
    else:
        raise ValueError(f"Unsupported format: {format}")
    
    return encoded.tobytes()

def create_test_video(width: int = 100, height: int = 100, fps: int = 30, duration: float = 1.0) -> bytes:
    """Create a test video in memory."""
    import tempfile
    import os
    
    # Create temporary file for video
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
        tmp_path = tmp_file.name
    
    try:
        # Video codec
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(tmp_path, fourcc, fps, (width, height))
        
        # Generate frames
        frame_count = int(fps * duration)
        for i in range(frame_count):
            # Create frame with changing content
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            # Add moving circle
            center_x = int((i / frame_count) * width)
            center_y = height // 2
            cv2.circle(frame, (center_x, center_y), 10, (255, 255, 255), -1)
            out.write(frame)
        
        out.release()
        
        # Read the created video file
        with open(tmp_path, 'rb') as f:
            video_bytes = f.read()
        
        return video_bytes
        
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

def create_test_svg() -> bytes:
    """Create a simple test SVG."""
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>'''
    return svg_content.encode('utf-8')

def create_invalid_file() -> bytes:
    """Create invalid file content for testing error cases."""
    return b"This is not a valid image or video file content"