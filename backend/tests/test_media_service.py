"""
Tests for media service functionality.
"""
from io import BytesIO

import pytest
from fastapi import UploadFile

from tests.conftest import create_invalid_file, create_test_image, create_test_svg, create_test_video
from web_buddy_backend.services.media_service import MediaProcessor, MediaValidationError


class TestMediaProcessor:
    """Test cases for MediaProcessor class."""

    def test_validate_supported_image_types(self):
        """Test validation of supported image file types."""
        processor = MediaProcessor()

        # Test supported image extensions
        for ext in [".jpg", ".jpeg", ".png", ".gif", ".svg"]:
            file = UploadFile(filename=f"test{ext}", file=BytesIO(create_test_image()))

            # Should not raise exception for supported types
            try:
                mime_type = processor.validate_file_type(file)
                assert mime_type is not None
            except MediaValidationError:
                pytest.fail(f"Should support {ext} files")

    def test_validate_unsupported_file_types(self):
        """Test rejection of unsupported file types."""
        processor = MediaProcessor()

        # Test unsupported extensions
        for ext in [".txt", ".pdf", ".doc", ".exe"]:
            file = UploadFile(filename=f"test{ext}", file=BytesIO(b"test content"))

            with pytest.raises(MediaValidationError) as exc_info:
                processor.validate_file_type(file)

            assert "Unsupported file extension" in str(exc_info.value)

    def test_validate_no_filename(self):
        """Test handling of files with no filename."""
        processor = MediaProcessor()

        file = UploadFile(filename=None, file=BytesIO(b"test content"))

        with pytest.raises(MediaValidationError) as exc_info:
            processor.validate_file_type(file)

        assert "No filename provided" in str(exc_info.value)

    def test_validate_and_process_valid_image(self):
        """Test processing of valid image files."""
        processor = MediaProcessor()

        # Test PNG image
        png_content = create_test_image(200, 150, "png")
        metadata = processor.validate_and_process_image(png_content, "image/png")

        assert metadata["width"] == 200
        assert metadata["height"] == 150
        assert metadata["channels"] in [1, 3, 4]  # Grayscale, RGB, or RGBA

    def test_validate_and_process_invalid_image(self):
        """Test processing of invalid image files."""
        processor = MediaProcessor()

        invalid_content = create_invalid_file()

        with pytest.raises(MediaValidationError) as exc_info:
            processor.validate_and_process_image(invalid_content, "image/png")

        assert "Invalid or corrupted image file" in str(exc_info.value)

    def test_validate_and_process_svg(self):
        """Test processing of SVG files."""
        processor = MediaProcessor()

        svg_content = create_test_svg()
        metadata = processor.validate_and_process_image(svg_content, "image/svg+xml")

        # SVG should return None for dimensions
        assert metadata["width"] is None
        assert metadata["height"] is None
        assert metadata["channels"] is None

    def test_validate_and_process_invalid_svg(self):
        """Test processing of invalid SVG files."""
        processor = MediaProcessor()

        invalid_svg = b"<html>This is not SVG</html>"

        with pytest.raises(MediaValidationError) as exc_info:
            processor.validate_and_process_image(invalid_svg, "image/svg+xml")

        assert "Invalid SVG content" in str(exc_info.value)

    def test_validate_and_process_valid_video(self):
        """Test processing of valid video files."""
        processor = MediaProcessor()

        # Create a test video
        video_content = create_test_video(320, 240, fps=30, duration=2.0)
        metadata = processor.validate_and_process_video(video_content, "video/mp4")

        assert metadata["width"] == 320
        assert metadata["height"] == 240
        assert metadata["fps"] == 30.0
        assert abs(metadata["duration"] - 2.0) < 0.1  # Allow small timing differences
        assert metadata["frame_count"] == 60  # 30 fps * 2 seconds

    def test_validate_and_process_invalid_video(self):
        """Test processing of invalid video files."""
        processor = MediaProcessor()

        invalid_content = create_invalid_file()

        with pytest.raises(MediaValidationError) as exc_info:
            processor.validate_and_process_video(invalid_content, "video/mp4")

        assert "Invalid or corrupted video file" in str(exc_info.value)

    def test_image_dimension_limits(self):
        """Test image dimension limits."""
        processor = MediaProcessor()

        # Test oversized image (this would fail in real OpenCV but we'll mock the validation)
        # For now, we'll test with a reasonable size and verify the validation logic exists
        large_image = create_test_image(5000, 5000, "png")
        metadata = processor.validate_and_process_image(large_image, "image/png")

        # Should process successfully as it's under our 10000x10000 limit
        assert metadata["width"] == 5000
        assert metadata["height"] == 5000

    def test_process_upload_image(self):
        """Test complete upload processing for images."""
        processor = MediaProcessor()

        # Create mock UploadFile
        content = create_test_image(100, 100, "png")
        file = UploadFile(filename="test.png", file=BytesIO(content))

        result = processor.process_upload(file, content)

        assert result["filename"] == "test.png"
        assert result["mime_type"] == "image/png"
        assert result["media_type"] == "image"
        assert result["size"] == len(content)
        assert result["width"] == 100
        assert result["height"] == 100

    def test_process_upload_video(self):
        """Test complete upload processing for videos."""
        processor = MediaProcessor()

        # Create mock UploadFile
        content = create_test_video(320, 240, fps=30, duration=1.0)
        file = UploadFile(filename="test.mp4", file=BytesIO(content))

        result = processor.process_upload(file, content)

        assert result["filename"] == "test.mp4"
        assert result["mime_type"] == "video/mp4"
        assert result["media_type"] == "video"
        assert result["size"] == len(content)
        assert result["width"] == 320
        assert result["height"] == 240
        assert abs(result["duration"] - 1.0) < 0.1

    def test_process_upload_invalid_file(self):
        """Test upload processing with invalid files."""
        processor = MediaProcessor()

        content = create_invalid_file()
        file = UploadFile(filename="test.txt", file=BytesIO(content))  # Unsupported extension

        # Should raise HTTPException due to unsupported file type
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            processor.process_upload(file, content)

        assert exc_info.value.status_code == 400

    def test_get_raw_bytes_existing_file(self, tmp_path):
        """Test getting raw bytes from existing file."""
        processor = MediaProcessor()

        # Create test file
        test_file = tmp_path / "test.txt"
        test_content = b"Hello, World!"
        test_file.write_bytes(test_content)

        result = processor.get_raw_bytes(test_file)
        assert result == test_content

    def test_get_raw_bytes_nonexistent_file(self, tmp_path):
        """Test getting raw bytes from non-existent file."""
        processor = MediaProcessor()

        nonexistent_file = tmp_path / "does_not_exist.txt"

        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            processor.get_raw_bytes(nonexistent_file)

        assert exc_info.value.status_code == 404
