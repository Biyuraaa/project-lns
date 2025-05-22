<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuotationRequest;
use App\Http\Requests\UpdateQuotationRequest;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $quotations = Quotation::select('quotations.*')
            ->with([
                'inquiry',
                'inquiry.customer:id,name',
            ])
            ->get();

        return Inertia::render('Dashboard/Quotations/Index', [
            'quotations' => $quotations
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get inquiries that don't have quotations with status "val"
        $inquiries = Inquiry::whereDoesntHave('quotations', function ($query) {
            $query->where('status', 'val');
        })
            ->with([
                'customer:id,name',
                'picEngineer:id,name',
                'sales:id,name',
                'businessUnit:id,name'
            ])
            ->get();

        return Inertia::render('Dashboard/Quotations/Create', [
            'inquiries' => $inquiries
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuotationRequest $request)
    {
        //
        try {
            $validatedData = $request->validated();

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('files/quotations', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            Quotation::create([
                'code' => $validatedData['code'],
                'status' => 'val',
                'due_date' => $validatedData['due_date'],
                'inquiry_id' => $validatedData['inquiry_id'],
                'file' => $validatedData['file'] ?? null,
            ]);

            return redirect()->route('quotations.index')->with('success', 'Quotation created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to create quotation: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Quotation $quotation)
    {
        //
        $quotation->load([
            'inquiry',
            'inquiry.customer',
            'inquiry.picEngineer',
            'inquiry.sales',
            'inquiry.businessUnit',
        ]);
        return Inertia::render('Dashboard/Quotations/Show', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quotation $quotation)
    {
        //
        $quotation->load([
            'inquiry',
            'inquiry.customer',
            'inquiry.picEngineer',
            'inquiry.sales',
        ]);

        return Inertia::render('Dashboard/Quotations/Edit', [
            'quotation' => $quotation
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuotationRequest $request, Quotation $quotation)
    {
        //
        try {
            $validatedData = $request->validated();

            // Handle file upload if a new file is provided
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($quotation->file) {
                    $oldFilePath = storage_path('app/public/files/quotations/' . $quotation->file);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                // Store new file
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('files/quotations', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            $quotation->update([
                'code' => $validatedData['code'],
                'status' => $validatedData['status'],
                'due_date' => $validatedData['due_date'],
                'file' => $validatedData['file'] ?? $quotation->file,
            ]);

            return redirect()->route('quotations.index')->with('success', 'Quotation updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to update quotation: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quotation $quotation)
    {
        //
        try {
            // Delete the quotation file if it exists
            if ($quotation->file) {
                $oldFilePath = storage_path('app/public/files/quotations/' . $quotation->file);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }

            // Delete the quotation
            $quotation->delete();

            return redirect()->route('quotations.index')->with('success', 'Quotation deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete quotation: ' . $e->getMessage());
        }
    }
}
