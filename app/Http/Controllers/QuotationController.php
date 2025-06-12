<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuotationRequest;
use App\Http\Requests\UpdateQuotationRequest;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class QuotationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-any-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view quotations.');
        }
        $quotations = Quotation::select('quotations.*')
            ->with([
                'inquiry',
                'inquiry.customer:id,name',
                'inquiry.businessUnit:id,name',
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create quotations.');
        }
        $inquiries = Inquiry::where('status', 'pending')->whereDoesntHave('quotation', function ($query) {
            $query->where('status', 'wip');
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
        try {
            $validatedData = $request->validated();
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('files/quotations', $filename, 'public');
                $validatedData['file'] = $filename;
            }
            $dueDate = new \DateTime($validatedData['due_date']);
            $year = $dueDate->format('Y');
            $month = (int)$dueDate->format('n');
            $romanMonths = [
                1 => 'I',
                2 => 'II',
                3 => 'III',
                4 => 'IV',
                5 => 'V',
                6 => 'VI',
                7 => 'VII',
                8 => 'VIII',
                9 => 'IX',
                10 => 'X',
                11 => 'XI',
                12 => 'XII'
            ];
            $romanMonth = $romanMonths[$month];
            $inquiry = Inquiry::findOrFail($validatedData['inquiry_id']);
            $quotationCount = Quotation::where('inquiry_id', $inquiry->id)->count();
            if ($quotationCount > 0) {
                $code = "{$inquiry->id}/Q{$quotationCount}/LNS/{$romanMonth}/{$year}";
            } else {
                $code = "{$inquiry->id}/Q/LNS/{$romanMonth}/{$year}";
            }
            Quotation::create([
                'code' => $code,
                'status' => 'val',
                'due_date' => $validatedData['due_date'],
                'amount' => $validatedData['amount'] ?? 0,
                'inquiry_id' => $validatedData['inquiry_id'],
                'file' => $validatedData['file'] ?? null,
            ]);
            $inquiry->update(['status' => 'process']);

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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view this quotation.');
        }
        $quotation->load([
            'inquiry',
            'inquiry.customer',
            'inquiry.picEngineer',
            'inquiry.sales',
            'inquiry.businessUnit',
            'negotiations',
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('update-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to edit this quotation.');
        }
        $quotation->load([
            'inquiry',
            'inquiry.customer',
            'inquiry.picEngineer',
            'inquiry.sales',
            'inquiry.businessUnit',
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
            if ($request->hasFile('file')) {
                if ($quotation->file) {
                    $oldFilePath = storage_path('app/public/files/quotations/' . $quotation->file);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('files/quotations', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            $quotation->update([
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('delete-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to delete this quotation.');
        }
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

    /**
     * Create a new negotiation for the quotation.
     */
    public function createNegotiation(Quotation $quotation)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-negotiation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create negotiations.');
        }
        $quotation->load([
            'inquiry',
            'inquiry.customer',
            'inquiry.picEngineer',
            'inquiry.sales',
            'inquiry.businessUnit',
        ]);

        return Inertia::render('Dashboard/Quotations/Negotiations/Create', [
            'quotation' => $quotation
        ]);
    }

    /**
     * Store a newly created negotiation in storage.
     */
    public function storeNegotiation(Request $request, Quotation $quotation)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-negotiation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create negotiations.');
        }

        try {
            $validatedData = $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:2048',
                'amount' => 'required|integer|min:0',
            ]);
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('files/negotiations', $filename, 'public');
            $validatedData['file'] = $filename;

            $quotation->negotiations()->create([
                'file' => $validatedData['file'],
                'quotation_id' => $quotation->id,
                'amount' => $validatedData['amount'],
            ]);

            $inquiry = $quotation->inquiry;

            $negotiationCount = $quotation->negotiations()->count();

            $today = now();
            $year = $today->format('Y');
            $month = (int)$today->format('n');
            $romanMonths = [
                1 => 'I',
                2 => 'II',
                3 => 'III',
                4 => 'IV',
                5 => 'V',
                6 => 'VI',
                7 => 'VII',
                8 => 'VIII',
                9 => 'IX',
                10 => 'X',
                11 => 'XI',
                12 => 'XII'
            ];
            $romanMonth = $romanMonths[$month];
            $revisedCode = "{$inquiry->id}/Q{$negotiationCount}/LNS/{$romanMonth}/{$year}";
            $quotation->update([
                'code' => $revisedCode,
                'amount' => $validatedData['amount'],
            ]);

            return redirect()->route('quotations.show', $quotation)->with('success', 'Negotiation created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to create negotiation: ' . $e->getMessage());
        }
    }
}
