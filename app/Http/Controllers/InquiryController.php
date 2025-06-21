<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInquiryRequest;
use App\Http\Requests\UpdateInquiryRequest;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\BusinessUnit;
use App\Models\Quotation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InquiryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-any-inquiry')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view inquiries.');
        }
        $inquiries = Inquiry::select('inquiries.*')
            ->with([
                'customer:id,name',
                'picEngineer:id,name',
                'sales:id,name',
                'businessUnit:id,name',
            ])
            ->get();
        return Inertia::render('Dashboard/Inquiries/Index', [
            'inquiries' => $inquiries
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-inquiry')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create inquiries.');
        }
        return Inertia::render('Dashboard/Inquiries/Create', [
            'customers' => Customer::all(),
            'picEngineers' => User::role('pic-engineer')->get(),
            'sales' => User::role('sales')->get(),
            'businessUnits' => BusinessUnit::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInquiryRequest $request)
    {
        try {
            $validatedData = $request->validated();
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '.' . $extension;
                $file->storeAs('files/inquiries', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            if ($request->boolean('new_customer')) {
                $customer = Customer::create([
                    'name' => $request->customer_name,
                    'email' => $request->customer_email,
                    'phone' => $request->customer_phone,
                    'address' => $request->customer_address,
                ]);
                $validatedData['customer_id'] = $customer->id;
            }
            $inquiry = Inquiry::create([
                'customer_id' => $validatedData['customer_id'],
                'description' => $validatedData['description'],
                'business_unit_id' => $validatedData['business_unit_id'],
                'inquiry_date' => $validatedData['inquiry_date'],
                'due_date' => $validatedData['due_date'] ?? null,
                'pic_engineer_id' => $validatedData['pic_engineer_id'] ?? null,
                'sales_id' => $validatedData['sales_id'] ?? null,
                'file' => $validatedData['file'] ?? null
            ]);

            if ($request->has('endUsers')) {
                $inquiry->endUsers()->createMany($request->endUsers);
            }

            $month = date('n');
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
            $year = date('Y');
            $code = $inquiry->id . '/I/LNS/' . $romanMonth . '/' . $year;
            $inquiry->update(['code' => $code]);

            return redirect()->route('inquiries.index')->with('success', 'Inquiry created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create inquiry: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'exception' => $e,
            ]);
            return redirect()->back()->withInput()->with('error', 'Failed to create inquiry: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inquiry $inquiry)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-inquiry')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view this inquiry.');
        }
        $inquiry->load([
            'customer',
            'picEngineer',
            'sales',
            'businessUnit',
            'endUsers'
        ]);

        return Inertia::render('Dashboard/Inquiries/Show', [
            'inquiry' => $inquiry,
            'quotation' => $inquiry->quotation,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inquiry $inquiry)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('update-inquiry')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to edit this inquiry.');
        }
        if ($inquiry->status === 'no_quot') {
            return redirect()->route('inquiries.index')
                ->with('error', 'This inquiry will not be quoted. You cannot edit it.');
        }
        $inquiry->load(['customer', 'picEngineer', 'sales', 'businessUnit', 'endUsers']);

        return Inertia::render('Dashboard/Inquiries/Edit', [
            'inquiry' => $inquiry,
            'customers' => Customer::all(),
            'picEngineers' => User::role('pic-engineer')->get(),
            'sales' => User::role('sales')->get(),
            'businessUnits' => BusinessUnit::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInquiryRequest $request, Inquiry $inquiry)
    {
        try {
            $validatedData = $request->validated();
            if ($request->hasFile('file')) {
                if ($inquiry->file) {
                    $oldFilePath = storage_path('app/public/files/inquiries/' . $inquiry->file);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = Str::slug($validatedData['code']) . '-' . time() . '.' . $extension;
                $file->storeAs('files/inquiries', $filename, 'public');
                $validatedData['file'] = $filename;
            }
            $inquiry->update([
                'code' => $validatedData['code'],
                'customer_id' => $validatedData['customer_id'],
                'description' => $validatedData['description'],
                'business_unit_id' => $validatedData['business_unit_id'],
                'inquiry_date' => $validatedData['inquiry_date'],
                'due_date' => $validatedData['due_date'] ?? $inquiry->due_date,
                'pic_engineer_id' => $validatedData['pic_engineer_id'] ?? $inquiry->pic_engineer_id,
                'sales_id' => $validatedData['sales_id'] ?? $inquiry->sales_id,
                'status' => $validatedData['status'],
                'file' => $validatedData['file'] ?? $inquiry->file
            ]);

            if ($request->has('endUsers')) {
                $inquiry->endUsers()->delete();
                $inquiry->endUsers()->createMany($request->endUsers);
            }

            return redirect()->route('inquiries.index')
                ->with('success', 'Inquiry updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update inquiry: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inquiry $inquiry)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('delete-inquiry')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to delete this inquiry.');
        }
        try {
            if ($inquiry->file) {
                $filePath = storage_path('app/public/files/inquiries/' . $inquiry->file);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            // Delete the inquiry
            $inquiry->delete();

            return redirect()->route('inquiries.index')
                ->with('success', 'Inquiry deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('inquiries.index')
                ->with('error', 'Failed to delete inquiry: ' . $e->getMessage());
        }
    }

    public function createQuotation(Inquiry $inquiry)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create quotations.');
        }
        $inquiry->load([
            'customer:id,name',
            'picEngineer:id,name',
            'sales:id,name',
            'businessUnit:id,name',
        ]);
        return Inertia::render('Dashboard/Inquiries/Quotations/Create', [
            'inquiry' => $inquiry,
        ]);
    }

    public function storeQuotation(Request $request, Inquiry $inquiry)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-quotation')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create quotations.');
        }
        $validatedData = $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'due_date' => 'required|date',
        ]);

        try {
            $filename = null;
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = 'quotation-inquiry-' . $inquiry->id . '-' . time() . '.' . $extension;
                $file->storeAs('files/quotations', $filename, 'public');
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
            $quotationCount = Quotation::where('inquiry_id', $inquiry->id)->count();
            if ($quotationCount > 0) {
                $code = "{$inquiry->id}/Q{$quotationCount}/LNS/{$romanMonth}/{$year}";
            } else {
                $code = "{$inquiry->id}/Q/LNS/{$romanMonth}/{$year}";
            }
            $inquiry->quotation()->create([
                'code' => $code,
                'file' => $filename,
                'due_date' => $validatedData['due_date'],
            ]);
            $inquiry->update(['status' => 'process']);

            return redirect()->route('inquiries.show', $inquiry)
                ->with('success', 'Quotation created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create quotation: ' . $e->getMessage(), [
                'inquiry_id' => $inquiry->id,
                'request_data' => $request->all(),
                'exception' => $e,
            ]);

            return redirect()->back()->withInput()
                ->with('error', 'Failed to create quotation. Please try again.');
        }
    }
}
