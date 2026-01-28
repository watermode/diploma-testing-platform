import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection
from django.core.management import call_command
from api.models import Test

print("STEP: load_fixtures.py started")
print("DB VENDOR:", connection.vendor)
print("DB NAME:", connection.settings_dict.get("NAME"))

before = Test.objects.count()
print("Test count BEFORE:", before)

if before > 0:
    print("Fixtures skipped: data already exists.")
else:
    print("Loading fixtures.json ...")
    call_command("loaddata", "fixtures.json", verbosity=2)

after = Test.objects.count()
print("Test count AFTER:", after)

if after == 0:
    raise SystemExit("ERROR: Fixtures loaded but Test count is still 0 (fixtures.json may be wrong)")