from rest_framework import serializers
from .models import Category, Expense, NoteItem, Vendor, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'active']


class NoteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteItem
        fields = ('id', 'category', 'product', 'qty', 'unit_price', 'line_total')
        read_only_fields = ('line_total',)

class ExpenseSerializer(serializers.ModelSerializer):
    items = NoteItemSerializer(many=True)

    class Meta:
        model = Expense
        fields = (
            'id',
            'project',
            'vendor',
            'number',
            'date',
            'attachment_url',
            'total',
            'items',
        )
        read_only_fields = ('total',)

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        expense = Expense.objects.create(**validated_data)
        total = 0
        for item in items_data:
            ni = NoteItem.objects.create(expense=expense, **item)
            total += ni.line_total
        expense.total = total
        expense.save(update_fields=['total'])
        return expense

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            total = 0
            for item in items_data:
                ni = NoteItem.objects.create(expense=instance, **item)
                total += ni.line_total
            instance.total = total
            instance.save(update_fields=['total'])
        return instance


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
