"""
Media processing service for handling image and video uploads.
Provides validation, metadata extraction, and file processing.
"""
import logging
import mimetypes
from pathlib import Path

import cv2
import magic
import numpy as np
from fastapi import HTTPException, UploadFile

logger = logging.getLogger(__name__)

# Supported file types
SUPPORTED_IMAGE_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml"
}
SUPPORTED_VIDEO_TYPES = {
    "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"
}
SUPPORTED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".svg",
    ".mp4", ".mov", ".avi", ".webm"
}

class MediaValidationError(Exception):
    """Raised when media validation fails."""
    pass

class MediaProcessor:
    """Handles media file validation, processing, and metadata extraction."""

    @staticmethod
    def validate_file_type(file: UploadFile) -> str:
        """
        Validate file type and return the detected MIME type.
        
        Args:
            file: The uploaded file
            
        Returns:
            str: The detected MIME type
            
        Raises:
            MediaValidationError: If file type is not supported
        """
        if not file.filename:
            raise MediaValidationError("No filename provided")

        # Check file extension
        file_path = Path(file.filename)
        extension = file_path.suffix.lower()

        if extension not in SUPPORTED_EXTENSIONS:
            raise MediaValidationError(
                f"Unsupported file extension: {extension}. "
                f"Supported extensions: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
            )

        # Read file content to detect MIME type
        current_pos = file.file.tell()  # Save current position
        file.file.seek(0)  # Go to start
        content_start = file.file.read(2048)  # Read first 2KB for detection
        file.file.seek(current_pos)  # Reset to original position

        if not content_start:
            raise MediaValidationError("File appears to be empty")

        try:
            # Use python-magic for more accurate MIME detection
            mime_type = magic.from_buffer(content_start, mime=True)
        except Exception as e:
            logger.warning(f"Magic MIME detection failed: {e}, falling back to mimetypes")
            mime_type, _ = mimetypes.guess_type(file.filename)
            if not mime_type:
                raise MediaValidationError("Could not determine file type")

        # Handle some edge cases where magic might return unexpected types
        if mime_type in ["application/x-empty", "application/octet-stream"]:
            # Fall back to extension-based detection
            mime_type, _ = mimetypes.guess_type(file.filename)
            if not mime_type:
                # Manual mapping for common types
                ext_to_mime = {
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".gif": "image/gif",
                    ".svg": "image/svg+xml",
                    ".mp4": "video/mp4",
                    ".mov": "video/quicktime",
                    ".avi": "video/x-msvideo",
                    ".webm": "video/webm"
                }
                mime_type = ext_to_mime.get(extension)
                if not mime_type:
                    raise MediaValidationError(f"Could not determine MIME type for {extension}")

        # Validate MIME type against supported types
        all_supported = SUPPORTED_IMAGE_TYPES | SUPPORTED_VIDEO_TYPES
        if mime_type not in all_supported:
            raise MediaValidationError(
                f"Unsupported MIME type: {mime_type}. "
                f"Supported types: {', '.join(sorted(all_supported))}"
            )

        return mime_type

    @staticmethod
    def validate_and_process_image(content: bytes, mime_type: str) -> dict[str, int | float]:
        """
        Validate image content and extract metadata.
        
        Args:
            content: Raw image bytes
            mime_type: MIME type of the image
            
        Returns:
            Dict containing image metadata (width, height, etc.)
            
        Raises:
            MediaValidationError: If image validation fails
        """
        try:
            # Handle SVG separately (OpenCV doesn't support SVG)
            if mime_type == "image/svg+xml":
                # Basic SVG validation - check if it contains SVG tags
                content_str = content.decode('utf-8', errors='ignore')
                if '<svg' not in content_str.lower():
                    raise MediaValidationError("Invalid SVG content")
                return {"width": None, "height": None, "channels": None}

            # Use OpenCV to validate and get image info
            nparr = np.frombuffer(content, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

            if img is None:
                raise MediaValidationError("Invalid or corrupted image file")

            height, width = img.shape[:2]
            channels = img.shape[2] if len(img.shape) > 2 else 1

            # Basic image validation
            if width <= 0 or height <= 0:
                raise MediaValidationError("Invalid image dimensions")

            if width > 10000 or height > 10000:
                raise MediaValidationError("Image dimensions too large (max 10000x10000)")

            return {
                "width": int(width),
                "height": int(height),
                "channels": int(channels)
            }

        except cv2.error as e:
            raise MediaValidationError(f"OpenCV error processing image: {e!s}")
        except Exception as e:
            raise MediaValidationError(f"Error processing image: {e!s}")

    @staticmethod
    def validate_and_process_video(content: bytes, mime_type: str) -> dict[str, int | float]:
        """
        Validate video content and extract metadata.
        
        Args:
            content: Raw video bytes
            mime_type: MIME type of the video
            
        Returns:
            Dict containing video metadata (width, height, duration, fps, etc.)
            
        Raises:
            MediaValidationError: If video validation fails
        """
        # For video validation, we need to save temporarily since OpenCV requires a file path
        import os
        import tempfile

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".tmp") as tmp_file:
                tmp_file.write(content)
                tmp_file.flush()
                tmp_path = tmp_file.name

            try:
                # Use OpenCV to validate and get video info
                cap = cv2.VideoCapture(tmp_path)

                if not cap.isOpened():
                    raise MediaValidationError("Invalid or corrupted video file")

                # Get video properties
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

                # Calculate duration
                duration = frame_count / fps if fps > 0 else 0

                # Basic validation
                if width <= 0 or height <= 0:
                    raise MediaValidationError("Invalid video dimensions")

                if width > 4096 or height > 4096:
                    raise MediaValidationError("Video dimensions too large (max 4096x4096)")

                if duration > 600:  # 10 minutes max
                    raise MediaValidationError("Video duration too long (max 10 minutes)")

                cap.release()

                return {
                    "width": width,
                    "height": height,
                    "duration": float(duration),
                    "fps": float(fps),
                    "frame_count": frame_count
                }

            finally:
                # Clean up temporary file
                cap.release()
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        except cv2.error as e:
            raise MediaValidationError(f"OpenCV error processing video: {e!s}")
        except Exception as e:
            raise MediaValidationError(f"Error processing video: {e!s}")

    @classmethod
    def process_upload(cls, file: UploadFile, content: bytes) -> dict[str, str | int | float | None]:
        """
        Process an uploaded media file with full validation and metadata extraction.
        
        Args:
            file: The uploaded file object
            content: Raw file bytes
            
        Returns:
            Dict containing file metadata and processing results
            
        Raises:
            HTTPException: If validation or processing fails
        """
        try:
            # Validate file type
            mime_type = cls.validate_file_type(file)

            # Determine media type category
            is_image = mime_type in SUPPORTED_IMAGE_TYPES
            is_video = mime_type in SUPPORTED_VIDEO_TYPES

            result = {
                "filename": file.filename,
                "mime_type": mime_type,
                "size": len(content),
                "media_type": "image" if is_image else "video",
            }

            # Process based on media type
            if is_image:
                metadata = cls.validate_and_process_image(content, mime_type)
                result.update(metadata)
            elif is_video:
                metadata = cls.validate_and_process_video(content, mime_type)
                result.update(metadata)

            return result

        except MediaValidationError as e:
            logger.warning(f"Media validation failed for {file.filename}: {e!s}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Unexpected error processing {file.filename}: {e!s}")
            raise HTTPException(status_code=500, detail="Internal server error processing media file")

    @staticmethod
    def get_raw_bytes(file_path: Path) -> bytes:
        """
        Get raw bytes from a file path.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Raw file bytes
            
        Raises:
            HTTPException: If file cannot be read
        """
        try:
            if not file_path.exists():
                raise HTTPException(status_code=404, detail="File not found")

            return file_path.read_bytes()

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {e!s}")
            raise HTTPException(status_code=500, detail="Error reading file")

# Global instance
media_processor = MediaProcessor()
