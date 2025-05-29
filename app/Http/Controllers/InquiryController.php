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

class InquiryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '.' . $extension; // Changed since code not available yet
                $file->storeAs('files/inquiries', $filename, 'public');
                $validatedData['file'] = $filename; // Store as file in database
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

            // Create the inquiry without specifying the code
            $inquiry = Inquiry::create([
                'customer_id' => $validatedData['customer_id'],
                'description' => $validatedData['description'],
                'business_unit_id' => $validatedData['business_unit_id'],
                'inquiry_date' => $validatedData['inquiry_date'],
                'end_user_name' => $validatedData['end_user_name'] ?? null,
                'end_user_email' => $validatedData['end_user_email'] ?? null,
                'end_user_phone' => $validatedData['end_user_phone'] ?? null,
                'end_user_address' => $validatedData['end_user_address'] ?? null,
                'pic_engineer_id' => $validatedData['pic_engineer_id'] ?? null,
                'sales_id' => $validatedData['sales_id'] ?? null,
                'file' => $validatedData['file'] ?? null
            ]);

            // Get current month in Roman numerals
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

            // Get current year
            $year = date('Y');

            // Generate inquiry code using the format: {id}/I/LNS/{MONTH_IN_ROMAN}/{YEAR}
            $code = $inquiry->id . '/I/LNS/' . $romanMonth . '/' . $year;

            // Update the inquiry with the generated code
            $inquiry->update(['code' => $code]);

            return redirect()->route('inquiries.index')->with('success', 'Inquiry created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to create inquiry: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inquiry $inquiry)
    {
        //
        $inquiry->load([
            'customer',
            'picEngineer',
            'sales',
            'businessUnit',
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
        $inquiry->load(['customer', 'picEngineer', 'sales', 'businessUnit']);

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

            // Handle file upload if a new file is provided
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($inquiry->file) {
                    $oldFilePath = storage_path('app/public/files/inquiries/' . $inquiry->file);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                // Store new file
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = Str::slug($validatedData['code']) . '-' . time() . '.' . $extension;
                $file->storeAs('files/inquiries', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            // Update the inquiry with validated data
            $inquiry->update([
                'code' => $validatedData['code'],
                'customer_id' => $validatedData['customer_id'],
                'description' => $validatedData['description'],
                'business_unit_id' => $validatedData['business_unit_id'],
                'inquiry_date' => $validatedData['inquiry_date'],
                'end_user_name' => $validatedData['end_user_name'] ?? $inquiry->end_user_name,
                'end_user_email' => $validatedData['end_user_email'] ?? $inquiry->end_user_email,
                'end_user_phone' => $validatedData['end_user_phone'] ?? $inquiry->end_user_phone,
                'end_user_address' => $validatedData['end_user_address'] ?? $inquiry->end_user_address,
                'pic_engineer_id' => $validatedData['pic_engineer_id'] ?? $inquiry->pic_engineer_id,
                'sales_id' => $validatedData['sales_id'] ?? $inquiry->sales_id,
                'status' => $validatedData['status'],
                'file' => $validatedData['file'] ?? $inquiry->file
            ]);

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
        try {
            // Delete associated file if exists
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
        // Validate the request
        $validatedData = $request->validate([
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'due_date' => 'required|date',
        ]);


        try {
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = $file->getClientOriginalExtension();
                $filename = Str::slug($validatedData['code']) . '-' . time() . '.' . $extension;
                $file->storeAs('files/quotations', $filename, 'public');
                $validatedData['file'] = $filename;
            }

            // Create the quotation
            $inquiry->quotation()->create([
                'file' => $validatedData['file'] ?? null,
                'due_date' => $validatedData['due_date'],
            ]);

            // Update the inquiry status to 'process'
            $inquiry->update(['status' => 'process']);

            return redirect()->route('inquiries.show',  $inquiry)
                ->with('success', 'Quotation created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Failed to create quotation: ' . $e->getMessage());
        }
    }
}
