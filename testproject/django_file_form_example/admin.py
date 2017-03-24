from django.contrib import admin

from .models import Example, Example2, ExampleFile


class ExampleFileInline(admin.TabularInline):
    model = ExampleFile


class Example2Admin(admin.ModelAdmin):
    inlines = [ExampleFileInline]


admin.site.register(Example)
admin.site.register(Example2, Example2Admin)
