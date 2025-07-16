from rest_framework import serializers
from .models import contact_us

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = contact_us
        fields = '__all__'
        read_only_fields = ('created_at', 'is_read')
    
    def validate_zip_code(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Zip code is required.')
        return value 