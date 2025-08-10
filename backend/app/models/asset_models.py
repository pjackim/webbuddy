from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal, Union, Annotated

class AssetBase(BaseModel):
    id: str
    screen_id: str
    x: float = 0
    y: float = 0
    z_index: int = 0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    type: Literal["image", "text"]

class ImageAsset(AssetBase):
    type: Literal["image"] = "image"
    src: HttpUrl
    natural_width: Optional[int] = None
    natural_height: Optional[int] = None
    width: Optional[float] = None
    height: Optional[float] = None

class TextAsset(AssetBase):
    type: Literal["text"] = "text"
    text: str
    font_size: float = 24
    color: str = "#ffffff"

Asset = Annotated[Union[ImageAsset, TextAsset], Field(discriminator="type")]

class AssetCreate(BaseModel):
    # For creation, allow no id, server will assign
    screen_id: str
    x: float = 0
    y: float = 0
    z_index: int = 0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    type: Literal["image", "text"]
    src: Optional[HttpUrl] = None
    text: Optional[str] = None
    font_size: Optional[float] = 24
    color: Optional[str] = "#ffffff"
    width: Optional[float] = None
    height: Optional[float] = None

class AssetUpdate(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    z_index: Optional[int] = None
    rotation: Optional[float] = None
    scale_x: Optional[float] = None
    scale_y: Optional[float] = None
    src: Optional[HttpUrl] = None
    text: Optional[str] = None
    font_size: Optional[float] = None
    color: Optional[str] = None
    width: Optional[float] = None
    height: Optional[float] = None
