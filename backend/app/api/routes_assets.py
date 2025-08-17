import uuid
from pathlib import Path

from app.core.config import settings
from app.models.asset_models import Asset, AssetCreate, AssetUpdate
from app.services.screen_service import SCREEN_CLIENT
from app.services.media_service import media_processor
from app.state.memory_state import STATE
from app.util.connection_manager import WS_MANAGER
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response

router = APIRouter(prefix="/assets", tags=["assets"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Expose uploads as static at /uploads (mounted in main)


@router.get("", response_model=list[Asset])
async def list_assets(screen_id: str | None = None):
    return await STATE.list_assets(screen_id)


@router.post("", response_model=Asset)
async def create_asset(payload: AssetCreate):
    # TODO: validate screen exists
    asset = await STATE.create_asset(payload)
    await SCREEN_CLIENT.apply_asset(asset)
    await WS_MANAGER.broadcast("asset_added", asset)
    return asset


@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: str, payload: AssetUpdate):
    asset = await STATE.update_asset(asset_id, payload)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await SCREEN_CLIENT.apply_asset(asset)
    await WS_MANAGER.broadcast("asset_updated", asset)
    return asset


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    # capture snapshot for external removal
    existing = [a for a in await STATE.list_assets() if a.id == asset_id]
    ok = await STATE.delete_asset(asset_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Asset not found")
    if existing:
        await SCREEN_CLIENT.remove_asset(existing[0])
    await WS_MANAGER.broadcast("asset_deleted", {"id": asset_id})
    return {"ok": True}


@router.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    """
    Upload image or video files with comprehensive validation and processing.
    
    Supports: PNG, JPEG, JPG, SVG, GIF for images and MP4, MOV, AVI, WEBM for videos.
    Returns metadata including dimensions, duration (for videos), and file info.
    """
    # Read file content
    content = await file.read()
    
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    # Validate file size (50MB max)
    max_size = 50 * 1024 * 1024  # 50MB
    if len(content) > max_size:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size: {max_size // (1024*1024)}MB")
    
    # Process and validate the media file
    metadata = media_processor.process_upload(file, content)
    
    # Generate unique filename with original extension
    suffix = Path(file.filename).suffix or ".bin"
    name = f"{uuid.uuid4()}{suffix}"
    dest = UPLOAD_DIR / name
    
    # Save the file
    try:
        dest.write_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Generate URL
    if settings.PUBLIC_BASE_URL:
        url = f"{settings.PUBLIC_BASE_URL.rstrip('/')}/uploads/{name}"
    else:
        url = f"/uploads/{name}"
    
    # Return comprehensive response
    response_data = {
        "url": url,
        "filename": file.filename,
        "stored_filename": name,
        "media_type": metadata["media_type"],
        "mime_type": metadata["mime_type"],
        "size": metadata["size"],
    }
    
    # Add media-specific metadata
    if metadata["media_type"] == "image":
        if metadata.get("width") is not None:
            response_data["width"] = metadata["width"]
            response_data["height"] = metadata["height"]
            response_data["channels"] = metadata["channels"]
    elif metadata["media_type"] == "video":
        response_data["width"] = metadata["width"]
        response_data["height"] = metadata["height"]
        response_data["duration"] = metadata["duration"]
        response_data["fps"] = metadata["fps"]
        response_data["frame_count"] = metadata["frame_count"]
    
    return JSONResponse(response_data)


@router.get("/raw/{filename}")
async def get_raw_media(filename: str):
    """
    Get raw byte content of an uploaded media file.
    Useful for relaying content to other backend services.
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Validate filename to prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    try:
        content = media_processor.get_raw_bytes(file_path)
        
        # Determine content type
        import mimetypes
        content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            content_type = "application/octet-stream"
        
        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(content))
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


@router.get("/info/{filename}")
async def get_media_info(filename: str):
    """
    Get metadata information about an uploaded media file without downloading it.
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Validate filename to prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    try:
        content = file_path.read_bytes()
        
        # Create a mock UploadFile for processing
        from io import BytesIO
        
        # Mock file object for metadata processing  
        class MockUploadFile:
            def __init__(self, filename: str, content: bytes):
                self.filename = filename
                self.file = BytesIO(content)
        
        mock_file = MockUploadFile(filename, content)
        metadata = media_processor.process_upload(mock_file, content)
        
        return JSONResponse(metadata)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file info: {str(e)}")
