#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "academic_portal.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django yüklenemedi. Sanal ortamınız aktif mi, yoksa Django kurulu mu kontrol edin."
        ) from exc
    execute_from_command_line(sys.argv)
