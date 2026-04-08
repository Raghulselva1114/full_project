
from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'username', 'password',]

    def create(self, validated_data): return User.objects.create_user(
        username=validated_data['username'],
        password=validated_data['password'],
        role='superadmin'
    )
