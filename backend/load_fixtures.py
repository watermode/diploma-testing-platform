import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection
from django.core.management import call_command
from api.models import Test

def db_info():
    s = connection.settings_dict
    return {
        "ENGINE": s.get("ENGINE"),
        "NAME": s.get("NAME"),
        "HOST": s.get("HOST"),
        "PORT": s.get("PORT"),
        "USER": s.get("USER"),
        "VENDOR": connection.vendor,
    }

print("DB INFO:", db_info())
print("Test count BEFORE:", Test.objects.count())

if Test.objects.exists():
    print("Fixtures skipped: data already exists.")
else:
    print("Loading fixtures.json ...")
    call_command("loaddata", "fixtures.json", verbosity=2)

print("Test count AFTER:", Test.objects.count())