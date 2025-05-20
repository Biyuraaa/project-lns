<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PicEngineerController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\NegotiationController;
use App\Http\Controllers\PurchaseOrderController;
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
    Route::get('/', function () {
        return Inertia::render('Dashboard/Index');
    })->name('dashboard');

    Route::resource('customers', CustomerController::class);
    Route::resource('sales', SalesController::class)->parameters([
        'sales' => 'sales'
    ]);
    Route::resource('picEngineers', PicEngineerController::class)->parameters([
        'picEngineer' => 'picEngineer'
    ]);


    Route::prefix('inquiries/{inquiry}/quotations')->group(function () {
        Route::get('create', [InquiryController::class, 'createQuotation'])->name('inquiries.quotations.create');
        Route::post('/', [InquiryController::class, 'storeQuotation'])->name('inquiries.quotations.store');
        Route::get('edit', [InquiryController::class, 'editQuotation'])->name('inquiries.quotations.edit');
        Route::patch('/', [InquiryController::class, 'updateQuotation'])->name('inquiries.quotations.update');
    });

    Route::prefix('quotations/{quotation}/negotiations')->group(function () {
        Route::get('create', [QuotationController::class, 'createNegotiation'])->name('quotations.negotiations.create');
        Route::post('/', [QuotationController::class, 'storeNegotiation'])->name('quotations.negotiations.store');
        Route::get('edit', [QuotationController::class, 'editNegotiation'])->name('quotations.negotiations.edit');
        Route::patch('/', [QuotationController::class, 'updateNegotiation'])->name('quotations.negotiations.update');
    });

    Route::resource('inquiries', InquiryController::class);
    Route::resource('quotations', QuotationController::class);
    Route::resource('negotiations', NegotiationController::class);
    Route::resource('purchaseOrders', PurchaseOrderController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
