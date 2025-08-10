def main(argv=None):
    import sys

    import pytest

    args = list(argv) if argv is not None else sys.argv[1:]
    return pytest.main(args)
