from rest_framework import serializers
from .models import Category, Expense, NoteItem, Vendor, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'active']


class NoteItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = NoteItem
        fields = (
            'id',
            'category',
            'category_name',
            'product',
            'product_name',
            'qty',
            'unit_price',
            'line_total',
        )


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"

class ExpenseSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(),
        source="vendor",
        write_only=True,
        required=False,
        allow_null=True
    )

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
            'vendor_id'
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

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
