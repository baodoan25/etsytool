"""
URL configuration for etsytool project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from .api_views import keyword_insights_view, listing_details_view, top_listings_view

urlpatterns = [
    path('', TemplateView.as_view(template_name='dashboard/index.html'), name='dashboard'),
    path('api/pod-research/top-listings', top_listings_view, name='top-listings-api'),
    path('api/pod-research/listings/<str:listing_id>', listing_details_view, name='listing-details-api'),
    path('api/pod-research/keyword-insights', keyword_insights_view, name='keyword-insights-api'),
    path('admin/', admin.site.urls),
]
