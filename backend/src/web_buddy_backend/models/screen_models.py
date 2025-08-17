from typing import Optional

from pydantic import BaseModel, Field


class ScreenCreate(BaseModel):
    name: str
    width: int = Field(gt=0)
    height: int = Field(gt=0)
    x: int = 0  # position on global canvas
    y: int = 0


class Screen(ScreenCreate):
    id: str


class ScreenUpdate(BaseModel):
    name: Optional[str] = None
    width: Optional[int] = Field(default=None, gt=0)
    height: Optional[int] = Field(default=None, gt=0)
    x: Optional[int] = None
    y: Optional[int] = None
