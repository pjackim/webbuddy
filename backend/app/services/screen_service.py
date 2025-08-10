import logging
from app.core.config import settings
from app.core.errors import ExternalServiceError
from app.models.asset_models import Asset, ImageAsset, TextAsset

log = logging.getLogger(__name__)

class ScreenServiceClient:
    """Wrapper around the auto-generated client from the external service.
    For now, this class logs actions; set EXTERNAL_ENABLED=true and provide
    SCREEN_SERVICE_URL/TOKEN to actually integrate.
    """
    def __init__(self) -> None:
        self.enabled = bool(settings.EXTERNAL_ENABLED and settings.SCREEN_SERVICE_URL)

    async def apply_asset(self, asset: Asset) -> None:
        if not self.enabled:
            log.info("(DRY-RUN) apply_asset: %s", asset.id)
            return
        try:
            if isinstance(asset, ImageAsset):
                # TODO: call generated client method to display/update image
                log.info("Updating image asset %s at (%s,%s) on screen %s", asset.id, asset.x, asset.y, asset.screen_id)
            elif isinstance(asset, TextAsset):
                # TODO: call generated client method to display/update text
                log.info("Updating text asset %s '%s'", asset.id, asset.text)
        except Exception as exc:
            log.exception("External service failure")
            raise ExternalServiceError(str(exc))

    async def remove_asset(self, asset: Asset) -> None:
        if not self.enabled:
            log.info("(DRY-RUN) remove_asset: %s", asset.id)
            return
        try:
            # TODO: call generated client method to remove asset
            log.info("Removing asset %s", asset.id)
        except Exception as exc:
            log.exception("External service failure")
            raise ExternalServiceError(str(exc))

SCREEN_CLIENT = ScreenServiceClient()
