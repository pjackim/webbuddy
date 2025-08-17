
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
    name: str | None = None
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    x: int | None = None
    y: int | None = None
