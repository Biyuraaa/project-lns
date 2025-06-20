<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PicEngineerController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\CompanyGrowthSellingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;

Route::controller(PageController::class)->group(function () {
    Route::get('/', 'index')->name('welcome');
    Route::get('/about', 'about')->name('about');
    Route::get('/services', 'services')->name('services');
});

Route::prefix('dashboard')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('customers', CustomerController::class);
    Route::resource('sales', SalesController::class)->parameters([
        'sales' => 'sales'
    ]);
    Route::resource('picEngineers', PicEngineerController::class)->parameters([
        'picEngineer' => 'picEngineer'
    ]);
    Route::prefix('inquiries/{inquiry}/quotations')->controller(InquiryController::class)->group(function () {
        Route::get('create', 'createQuotation')->name('inquiries.quotations.create');
        Route::post('/',  'storeQuotation')->name('inquiries.quotations.store');
        Route::get('{quotation}/edit',  'editQuotation')->name('inquiries.quotations.edit');
        Route::patch('{quotation}',  'updateQuotation')->name('inquiries.quotations.update');
        Route::delete('{quotation}', 'destroyQuotation')->name('inquiries.quotations.destroy');
    });
    Route::prefix('quotations/{quotation}/negotiations')->name('quotations.negotiations.')->controller(QuotationController::class)->group(function () {
        Route::get('create', 'createNegotiation')->name('create');
        Route::post('/',  'storeNegotiation')->name('store');
        Route::get('{negotiation}/edit',  'editNegotiation')->name('edit');
        Route::patch('{negotiation}',  'updateNegotiation')->name('update');
        Route::delete('{negotiation}', 'destroyNegotiation')->name('destroy');
    });

    Route::resource('inquiries', InquiryController::class);
    Route::resource('quotations', QuotationController::class);
    Route::resource('purchaseOrders', PurchaseOrderController::class);
    Route::resource('targetSales', CompanyGrowthSellingController::class)->except('show');
});

require __DIR__ . '/auth.php';
