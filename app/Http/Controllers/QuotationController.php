<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuotationRequest;
use App\Http\Requests\UpdateQuotationRequest;
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
        //

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuotationRequest $request)
    {
        //
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
            'negotiations'
        ]);
        return Inertia::render('Dashboard/Quotations/Show', [
            'quotation' => $quotation,
            'negotiations' => $quotation->negotiations
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
            'negotiations'
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

    public function createNegotiation(Quotation $quotation)
    {
        //
        $quotation->load([
            'inquiry',
            'inquiry.customer',
            'inquiry.picEngineer',
            'inquiry.sales',
            'negotiations'
        ]);
        return Inertia::render('Dashboard/Quotations/Negotiations/Create', [
            'quotation' => $quotation
        ]);
    }

    public function storeNegotiation(Request $request, Quotation $quotation)
    {
        try {
            $validatedData = $request->validate([
                'code' => 'required|string|max:255',
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ]);

            // Handle file upload if a new file is provided
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('files/quotations', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            // Create the negotiation
            $quotation->negotiations()->create([
                'code' => $validatedData['code'] ?? null,
                'file' => $validatedData['file'] ?? null,
            ]);

            return redirect()->route('quotations.show', $quotation)->with('success', 'Negotiation created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to create negotiation: ' . $e->getMessage());
        }
    }
}
