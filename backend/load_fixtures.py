import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.management import call_command
from django.db import connection
from api.models import Test

BASE_DIR = os.path.dirname(__file__)
FIXTURE_PATH = os.path.join(BASE_DIR, "fixtures.json")

print("=== FIXTURES LOADER ===")
print("DB vendor:", connection.vendor)
print("Fixture path:", FIXTURE_PATH)
print("Exists:", os.path.exists(FIXTURE_PATH))

before = Test.objects.count()
print("Test count BEFORE:", before)

if before == 0:
    print("Running loaddata ...")
    call_command("loaddata", FIXTURE_PATH, verbosity=2)
else:
    print("Skip: tests already exist")

after = Test.objects.count()
print("Test count AFTER:", after)

if after == 0:
    raise SystemExit("ERROR: fixtures not loaded (Test count still 0)")