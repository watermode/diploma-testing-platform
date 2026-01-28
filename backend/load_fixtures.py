import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection
from django.core.management import call_command
from api.models import Test

FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures.json")

print("STEP: load_fixtures.py started")
print("DB VENDOR:", connection.vendor)
print("DB NAME:", connection.settings_dict.get("NAME"))
print("FIXTURE PATH:", FIXTURE_PATH)

before = Test.objects.count()
print("Test count BEFORE:", before)

if before == 0:
    print("Loading fixtures...")
    call_command("loaddata", FIXTURE_PATH, verbosity=2)
else:
    print("Fixtures skipped: data already exists.")

after = Test.objects.count()
print("Test count AFTER:", after)

if after == 0:
    raise SystemExit("ERROR: fixtures did not load (Test count is still 0)")