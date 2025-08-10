from fastapi import HTTPException, status

class ExternalServiceError(HTTPException):
    def __init__(self, detail: str = "External service error"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
