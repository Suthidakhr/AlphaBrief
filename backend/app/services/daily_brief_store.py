from datetime import date
from threading import Lock


class DailyBriefStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._briefs: dict[str, dict] = {}

    def upsert(self, payload_dict: dict) -> str:
        with self._lock:
            key = payload_dict["brief_date"].isoformat()
            status = "created" if key not in self._briefs else "updated"
            self._briefs[key] = dict(payload_dict)
            return status

    def get_for_date(self, d: date) -> dict | None:
        with self._lock:
            return dict(self._briefs[d.isoformat()]) if d.isoformat() in self._briefs else None

    def reset(self) -> None:
        with self._lock:
            self._briefs = {}


daily_brief_store = DailyBriefStore()
