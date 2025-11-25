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

        # ================================
        # 🔥 ATUALIZAR SALDO DO PROJETO
        # ================================
        project = expense.project
        project.cash_balance -= total        # --- NOVO ---
        project.save(update_fields=['cash_balance'])   # --- NOVO ---
        # ================================

        return expense

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # ----------------------------------------------
        # 🔥 1. Guardar total antigo da nota
        # ----------------------------------------------
        old_total = instance.total

        # Atualiza campos simples
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # ----------------------------------------------
        # 🔥 2. Recriar itens e recalcular novo total
        # ----------------------------------------------
        if items_data is not None:
            instance.items.all().delete()
            new_total = 0
            for item in items_data:
                ni = NoteItem.objects.create(expense=instance, **item)
                new_total += ni.line_total

            instance.total = new_total
            instance.save(update_fields=['total'])

            # ----------------------------------------------
            # 🔥 3. Ajustar saldo do projeto pela DIFERENÇA
            # ----------------------------------------------
            diff = new_total - old_total   # positivo = aumentou a nota
            project = instance.project
            project.cash_balance -= diff   # diminui saldo proporcionalmente
            project.save(update_fields=['cash_balance'])
            # ----------------------------------------------

        return instance


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
