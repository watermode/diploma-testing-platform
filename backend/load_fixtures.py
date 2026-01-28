import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.models import Test
from django.core.management import call_command

if Test.objects.exists():
    print("Fixtures skipped: data already exists.")
else:
    print("Loading fixtures.json ...")
    call_command("loaddata", "fixtures.json")