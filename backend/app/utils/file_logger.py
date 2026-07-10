from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock


class UTCFileFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        dt = datetime.fromtimestamp(record.created, tz=timezone.utc)
        if datefmt:
            return dt.strftime(datefmt)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


class UTCDailyFileHandler(logging.Handler):
    def __init__(self, log_dir: Path):
        super().__init__()
        self.log_dir = log_dir
        self._lock = RLock()
        self._current_date = None
        self._stream = None
        self.setFormatter(UTCFileFormatter("%(asctime)s|%(levelname)s| %(message)s"))

    def _log_path_for_today(self) -> Path:
        current_utc_date = datetime.now(timezone.utc).strftime("%d_%m_%Y")
        return self.log_dir / f"{current_utc_date}.log"

    def _ensure_stream(self):
        today = datetime.now(timezone.utc).strftime("%d_%m_%Y")

        if self._stream and self._current_date == today:
            return

        self._close_stream()
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self._current_date = today
        self._stream = open(self._log_path_for_today(), "a", encoding="utf-8")

    def _close_stream(self):
        if self._stream:
            try:
                self._stream.close()
            finally:
                self._stream = None

    def emit(self, record):
        try:
            with self._lock:
                self._ensure_stream()
                message = self.format(record)
                self._stream.write(message + "\n")
                self._stream.flush()
        except Exception:
            self.handleError(record)

    def close(self):
        with self._lock:
            self._close_stream()
        super().close()


_loggers: dict[str, logging.Logger] = {}


def get_backend_logger(name: str = "backend") -> logging.Logger:
    if name in _loggers:
        return _loggers[name]

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not any(isinstance(handler, UTCDailyFileHandler) for handler in logger.handlers):
        project_root = Path(__file__).resolve().parents[2]
        log_dir = project_root / "logs"
        logger.addHandler(UTCDailyFileHandler(log_dir))

    _loggers[name] = logger
    return logger
