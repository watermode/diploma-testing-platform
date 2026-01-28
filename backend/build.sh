#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# ---- Load fixtures only if database is empty ----
python - <<'PY'
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import Test

if Test.objects.exists():
    print("Fixtures skipped: data already exists.")
else:
    print("Loading fixtures.json ...")
    import subprocess
    subprocess.check_call(["python", "manage.py", "loaddata", "fixtures.json"])
PY