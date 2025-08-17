from typing import Annotated, Literal

from pydantic import BaseModel, Field, HttpUrl


class AssetBase(BaseModel):
    id: str
    screen_id: str
    x: float = 0
    y: float = 0
    z_index: int = 0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    type: Literal["image", "text", "video"]


class ImageAsset(AssetBase):
    type: Literal["image"] = "image"
    src: HttpUrl
    natural_width: int | None = None
    natural_height: int | None = None
    width: float | None = None
    height: float | None = None


class TextAsset(AssetBase):
    type: Literal["text"] = "text"
    text: str
    font_size: float = 24
    color: str = "#ffffff"


class VideoAsset(AssetBase):
    type: Literal["video"] = "video"
    src: HttpUrl
    natural_width: int | None = None
    natural_height: int | None = None
    width: float | None = None
    height: float | None = None
    duration: float | None = None  # Duration in seconds
    autoplay: bool = False
    loop: bool = False
    muted: bool = False


Asset = Annotated[ImageAsset | TextAsset | VideoAsset, Field(discriminator="type")]


class AssetCreate(BaseModel):
    # For creation, allow no id, server will assign
    screen_id: str
    x: float = 0
    y: float = 0
    z_index: int = 0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    type: Literal["image", "text", "video"]
    src: HttpUrl | None = None
    text: str | None = None
    font_size: float | None = 24
    color: str | None = "#ffffff"
    width: float | None = None
    height: float | None = None
    duration: float | None = None
    autoplay: bool | None = False
    loop: bool | None = False
    muted: bool | None = False


class AssetUpdate(BaseModel):
    x: float | None = None
    y: float | None = None
    z_index: int | None = None
    rotation: float | None = None
    scale_x: float | None = None
    scale_y: float | None = None
    src: HttpUrl | None = None
    text: str | None = None
    font_size: float | None = None
    color: str | None = None
    width: float | None = None
    height: float | None = None
    duration: float | None = None
    autoplay: bool | None = None
    loop: bool | None = None
    muted: bool | None = None
