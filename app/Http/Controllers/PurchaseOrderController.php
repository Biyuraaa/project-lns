<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Models\BusinessUnit;
use Inertia\Inertia;
use App\Models\Inquiry;
use Illuminate\Support\Facades\Log;
use App\Models\Quotation;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $purchaseOrders = PurchaseOrder::select('purchase_orders.*')
            ->with([
                'quotation:id,code,inquiry_id',
                'quotation.inquiry:id,customer_id,business_unit_id',
                'quotation.inquiry.customer:id,name,email,phone',
                'quotation.inquiry.businessUnit:id,name'
            ])
            ->get();
        $businessUnits = BusinessUnit::all();

        return Inertia::render('Dashboard/PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
            'businessUnits' => $businessUnits
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        $quotations = Quotation::select('quotations.*')
            ->with([
                'inquiry:id,code,customer_id',
                'inquiry.customer:id,name,email,phone',
            ])
            ->where('status', 'wip')
            ->whereDoesntHave('purchaseOrder')
            ->get();
        return Inertia::render('Dashboard/PurchaseOrders/Create', [
            'quotations' => $quotations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePurchaseOrderRequest $request)
    {
        //
        try {
            $validatedData = $request->validated();
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = Str::slug($validatedData['code']) . '-' . time() . '.' . $extension;
                $file->storeAs('files/purchase-orders', $filename, 'public');
                $validatedData['file'] = $filename;
            }
            PurchaseOrder::create([
                'code' => $validatedData['code'],
                'quotation_id' => $validatedData['quotation_id'],
                'file' => $validatedData['file'] ?? null,
                'amount' => $validatedData['amount'],
                'status' => $validatedData['status'],
                'contract_number' => $validatedData['contract_number'],
                'job_number' => $validatedData['job_number'],
                'date' => $validatedData['date'],
            ]);

            return redirect()->route('purchaseOrders.index')->with('success', 'Purchase Order created successfully.');
        } catch (\Exception $e) {
            // Handle the exception
            return redirect()->back()->with('error', 'Failed to create purchase order: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        //
        $purchaseOrder->load([
            'quotation:id,code,inquiry_id',
            'quotation.inquiry.customer',
        ]);
        return Inertia::render('Dashboard/PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseOrder $purchaseOrder)
    {
        //
        $quotations = Quotation::select('quotations.*')
            ->with([
                'inquiry:id,code,customer_id',
                'inquiry.customer:id,name,email,phone',
            ])
            ->where('status', 'val')
            ->whereDoesntHave('purchaseOrder')
            ->get();
        return Inertia::render('Dashboard/PurchaseOrders/Edit', [
            'purchaseOrder' => $purchaseOrder,
            'quotations' => $quotations,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        //
        try {
            $validatedData = $request->validated();
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($purchaseOrder->file) {
                    $oldFilePath = storage_path('app/public/files/purchase-orders/' . $purchaseOrder->file);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }
                // Store new file
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = Str::slug($validatedData['code']) . '-' . time() . '.' . $extension;
                $file->storeAs('files/purchase-orders', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            $purchaseOrder->update([
                'code' => $validatedData['code'],
                'quotation_id' => $validatedData['quotation_id'],
                'file' => $validatedData['file'] ?? null,
                'amount' => $validatedData['amount'],
                'status' => $validatedData['status'],
                'contract_number' => $validatedData['contract_number'],
                'job_number' => $validatedData['job_number'],
                'date' => $validatedData['date'],
            ]);

            return redirect()->route('purchaseOrders.index')->with('success', 'Purchase Order updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update purchase order: ' . $e->getMessage());
            // Handle the exception
            return redirect()->back()->with('error', 'Failed to update purchase order: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        //
        try {
            // Delete the file if it exists
            if ($purchaseOrder->file) {
                $oldFilePath = storage_path('app/public/files/purchase-orders/' . $purchaseOrder->file);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }
            $purchaseOrder->delete();
            return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete purchase order: ' . $e->getMessage());
        }
    }
}
