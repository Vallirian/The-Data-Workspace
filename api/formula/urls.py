from django.urls import path
from .views import (
    FormulaListView, 
    FormulaDetailView, 
)

urlpatterns = [
    path('workbook/<str:workbook_id>/', FormulaListView.as_view(), name='formula-list'),
    path('formula/<str:formula_id>/', FormulaDetailView.as_view(), name='formula-detail'),
]
