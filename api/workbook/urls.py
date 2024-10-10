from django.urls import path
from workbook.views.workbook_views import WorkbookListAPIView, WorkbookDetailAPIView
from workbook.views.report_views import ReportDetailAPIView
from workbook.views.datatable_views import DataTableMetaDetailAPIView, DataTableExtractionAPIView, DataTableRawAPIView, DataTableColumnMetaListAPIView, DataTableColumnMetaDetailAPIView
from workbook.views.formula_views import FormulaListView, FormulaDetailView, FormulaDetailValueView

urlpatterns = [
    # workbook
    path('', WorkbookListAPIView.as_view(), name='workbook-list'), 
    path('<str:workbook_id>/', WorkbookDetailAPIView.as_view(), name='workbook-detail'),  

    # report
    path('<str:workbook_id>/report/<str:report_id>/', ReportDetailAPIView.as_view(), name='report-detail'),

    # formula
    path('<str:workbook_id>/fromulas/', FormulaListView.as_view(), name='formula-list'),
    path('<str:workbook_id>/formulas/<str:formula_id>/', FormulaDetailView.as_view(), name='formula-detail'),
    path('<str:workbook_id>/formulas/<str:formula_id>/value/', FormulaDetailValueView.as_view(), name='formula-detail-value'),

    # datatable
    path('<str:workbook_id>/datatable/<str:table_id>/', DataTableMetaDetailAPIView.as_view(), name='datatablemeta-detail'),
    path('<str:workbook_id>/datatable/<str:table_id>/columns/', DataTableColumnMetaListAPIView.as_view(), name='datatablemeta-columns-list'),
    path('<str:workbook_id>/datatable/<str:table_id>/columns/<str:column_id>/', DataTableColumnMetaDetailAPIView.as_view(), name='datatablemeta-columns-detail'),
    path('<str:workbook_id>/datatable/<str:table_id>/extract/', DataTableExtractionAPIView.as_view(), name='datatable-extraction'),
    path('<str:workbook_id>/datatable/<str:table_id>/raw/', DataTableRawAPIView.as_view(), name='datatable-raw'),
]