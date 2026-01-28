import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.management import call_command
from api.models import Test

FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures.json")

print("FIXTURE PATH:", FIXTURE_PATH)
print("Tests before:", Test.objects.count())

if Test.objects.exists():
    print("Fixtures skipped: data already exists.")
else:
    print("Loading fixtures...")
    call_command("loaddata", FIXTURE_PATH)
    print("Fixtures loaded.")
    print("Tests after:", Test.objects.count())