from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import Test, Question, Choice, Attempt, AttemptAnswer


class TestListSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ["id", "title", "description", "questions_count", "created_at"]

    def get_questions_count(self, obj):
        return obj.questions.count()


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    correct_choice_id = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "text", "order", "choices", "correct_choice_id"]

    def get_correct_choice_id(self, obj):
        correct = obj.choices.filter(is_correct=True).first()
        return correct.id if correct else None


class TestDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ["id", "title", "description", "questions"]


class AttemptListSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "test",
            "test_title",
            "started_at",
            "finished_at",
            "score",
            "total",
            "percent",
            "finished_reason",
        ]


class AttemptCreateSerializer(serializers.Serializer):
    test_id = serializers.IntegerField()
    finished_reason = serializers.ChoiceField(choices=["completed", "timeout"])
    answers = serializers.DictField(
        child=serializers.IntegerField(),
        help_text='Словарь: {"question_id": choice_id, ...}',
    )

    def validate(self, attrs):
        test_id = attrs["test_id"]
        answers = attrs.get("answers") or {}

        try:
            test = Test.objects.get(pk=test_id)
        except Test.DoesNotExist:
            raise serializers.ValidationError({"test_id": "Test not found"})

        test_question_ids = set(test.questions.values_list("id", flat=True))

        for qid_str, choice_id in answers.items():
            try:
                qid = int(qid_str)
            except ValueError:
                raise serializers.ValidationError({"answers": "question_id must be int"})

            if qid not in test_question_ids:
                raise serializers.ValidationError({"answers": f"Question {qid} not in this test"})

            if not Choice.objects.filter(id=choice_id, question_id=qid).exists():
                raise serializers.ValidationError({"answers": f"Choice {choice_id} not valid for question {qid}"})

        attrs["test"] = test
        return attrs

    def create(self, validated_data):
        test = validated_data["test"]
        answers = validated_data.get("answers") or {}
        finished_reason = validated_data["finished_reason"]

        total = test.questions.count()

        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            attempt_user = user
        else:
            attempt_user = None

        attempt = Attempt.objects.create(
            user=attempt_user,
            test=test,
            total=total,
            finished_reason=finished_reason,
            finished_at=timezone.now(),
        )

        correct_count = 0
        per_question = []

        for q in test.questions.all():
            qid = q.id
            if str(qid) not in answers and qid not in answers:
                continue

            choice_id = answers.get(str(qid), answers.get(qid))
            choice = Choice.objects.get(id=choice_id)

            is_correct = bool(choice.is_correct)
            if is_correct:
                correct_count += 1

            AttemptAnswer.objects.create(
                attempt=attempt,
                question=q,
                choice=choice,
                is_correct=is_correct,
            )

            correct_choice = q.choices.filter(is_correct=True).first()

            per_question.append({
                "question_id": qid,
                "selected_choice_id": choice.id,
                "correct_choice_id": correct_choice.id if correct_choice else None,
                "is_correct": is_correct,
            })

        attempt.score = correct_count
        attempt.percent = (correct_count / total * 100) if total else 0
        attempt.save(update_fields=["score", "percent"])

        return {
            "attempt_id": attempt.id,
            "test_id": test.id,
            "finished_reason": attempt.finished_reason,
            "score": attempt.score,
            "total": attempt.total,
            "percent": attempt.percent,
            "results": per_question,
        }


class AttemptPreviewSerializer(AttemptCreateSerializer):
    """
    Такой же вход, как AttemptCreateSerializer, но ничего не сохраняет в БД.
    Возвращает тот же формат ответа, который ждёт фронт.
    """

    def create(self, validated_data):
        test = validated_data["test"]
        answers = validated_data.get("answers") or {}
        finished_reason = validated_data["finished_reason"]

        total = test.questions.count()
        correct_count = 0
        per_question = []

        for q in test.questions.all():
            qid = q.id
            if str(qid) not in answers and qid not in answers:
                continue

            choice_id = answers.get(str(qid), answers.get(qid))
            choice = Choice.objects.get(id=choice_id)

            is_correct = bool(choice.is_correct)
            if is_correct:
                correct_count += 1

            correct_choice = q.choices.filter(is_correct=True).first()

            per_question.append({
                "question_id": qid,
                "selected_choice_id": choice.id,
                "correct_choice_id": correct_choice.id if correct_choice else None,
                "is_correct": is_correct,
            })

        percent = (correct_count / total * 100) if total else 0

        return {
            "attempt_id": None,
            "test_id": test.id,
            "finished_reason": finished_reason,
            "score": correct_count,
            "total": total,
            "percent": percent,
            "results": per_question,
        }


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        username = validated_data.get("username")
        email = validated_data.get("email", "")
        password = validated_data.get("password")

        user = User(username=username, email=email)
        user.set_password(password)
        user.save()
        return user


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]