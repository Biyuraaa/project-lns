<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PicEngineerController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\CompanyGrowthSellingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome/Index', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

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
        Route::get('edit',  'editQuotation')->name('inquiries.quotations.edit');
        Route::patch('/',  'updateQuotation')->name('inquiries.quotations.update');
    });
    Route::prefix('quotations/{quotation}/negotiations')->controller(QuotationController::class)->group(function () {
        Route::get('create', 'createNegotiation')->name('quotations.negotiations.create');
        Route::post('/',  'storeNegotiation')->name('quotations.negotiations.store');
        Route::get('edit',  'editNegotiation')->name('quotations.negotiations.edit');
        Route::patch('/',  'updateNegotiation')->name('quotations.negotiations.update');
    });
    Route::resource('inquiries', InquiryController::class);
    Route::resource('quotations', QuotationController::class);
    Route::resource('purchaseOrders', PurchaseOrderController::class);
    Route::resource('targetSales', CompanyGrowthSellingController::class)->except('show');
});

require __DIR__ . '/auth.php';
