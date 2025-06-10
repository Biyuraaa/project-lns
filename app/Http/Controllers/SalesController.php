<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesRequest;
use App\Http\Requests\UpdateSalesRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-any-sales')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view sales users.');
        }
        $sales = User::role('sales')->get();

        return Inertia::render('Dashboard/Sales/Index', [
            'sales' => $sales
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
        if (!$user->hasPermissionTo('create-sales')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create sales users.');
        }
        return Inertia::render('Dashboard/Sales/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalesRequest $request)
    {
        //
        try {
            $validatedData = $request->validated();

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug($request->name) . '.' . $extension;
                $image->storeAs('images/sales', $filename, 'public');
                $validatedData['image'] = $filename;
            }
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => bcrypt($validatedData['password']),
                'phone' => $validatedData['phone'] ?? null,
                'address' => $validatedData['address'] ?? null,
                'image' => $validatedData['image'] ?? null,
            ]);
            $user->assignRole('sales');
            return redirect()->route('sales.index')
                ->with('success', 'Sales person created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create sales user: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $sales)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $sales)
    {
        //
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('update-sales')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to edit sales users.');
        }
        return Inertia::render('Dashboard/Sales/Edit', [
            'sales' => $sales
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalesRequest $request, User $sales)
    {
        try {
            // Validate request data
            $validatedData = $request->validated();

            // Handle image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image if it exists
                if ($sales->image) {
                    $oldImagePath = public_path('storage/images/sales/' . $sales->image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // Process and store new image
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug($request->name) . '.' . $extension;
                $image->storeAs('images/sales', $filename, 'public');
                $validatedData['image'] = $filename;
            }

            // Handle password if provided
            if (!empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }

            // Update the user
            $sales->update([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'] ?? null,
                'address' => $validatedData['address'] ?? null,
                'password' => $validatedData['password'] ?? $sales->password,
                'image' => $validatedData['image'] ?? $sales->image,

            ]);

            if (isset($validatedData['status'])) {
                $sales->status = $validatedData['status'];
                $sales->save();
            }
            if (!$sales->hasRole('sales')) {
                $sales->assignRole('sales');
            }
            return redirect()->route('sales.index')
                ->with('success', 'Sales person updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update sales person: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $sales)
    {
        //
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            if (!$user->hasPermissionTo('delete-sales')) {
                return redirect()->route('dashboard')
                    ->with('error', 'You do not have permission to delete sales users.');
            }
            if ($sales->image) {
                $oldImagePath = public_path('storage/images/sales/' . $sales->image);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            $sales->delete();
            return redirect()->route('sales.index')
                ->with('success', 'Sales person deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete sales user: ' . $e->getMessage());
        }
    }
}
