import logging

FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATEFMT = "%Y-%m-%d %H:%M:%S"

_def_level = logging.INFO

def configure_logging(level: int = _def_level) -> None:
    logging.basicConfig(level=level, format=FORMAT, datefmt=DATEFMT)
