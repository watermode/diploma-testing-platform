from django.conf import settings
from django.db import models


class Test(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class Attempt(models.Model):
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attempts",
        null=True,
        blank=True,
    )

    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="attempts")
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    score = models.IntegerField(default=0)   
    total = models.IntegerField(default=0)   
    percent = models.FloatField(default=0)

    finished_reason = models.CharField(
        max_length=20,
        choices=[("completed", "Completed"), ("timeout", "Timeout")],
        default="completed",
    )

    def __str__(self):
        return f"Attempt #{self.id} ({self.test.title})"


class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    
    choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True)

    is_correct = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["attempt", "question"], name="uniq_attempt_question")
        ]

    def __str__(self):
        return f"Attempt {self.attempt_id} Q{self.question_id} → {self.is_correct}"