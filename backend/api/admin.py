from django.contrib import admin
from .models import Test, Question, Choice, Attempt, AttemptAnswer

admin.site.register(Test)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(Attempt)
admin.site.register(AttemptAnswer)
