<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdatePicEngineerRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PicEngineerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $picEngineers = User::role('pic-engineer')->get();

        return Inertia::render('Dashboard/PicEngineers/Index', [
            'pic_engineers' => $picEngineers
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Dashboard/PicEngineers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        //
        try {
            $validatedData = $request->validated();

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug($request->name) . '.' . $extension;
                $image->storeAs('images/pic_engineers', $filename, 'public');
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

            $user->assignRole('pic-engineer');
            return redirect()->route('picEngineers.index')
                ->with('success', 'PIC Engineer person created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create sales user: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $picEngineer)
    {
        //

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $picEngineer)
    {
        //
        return Inertia::render('Dashboard/PicEngineers/Edit', [
            'pic_engineer' => $picEngineer
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePicEngineerRequest $request, User $picEngineer)
    {

        //
        try {
            // Validate request data
            $validatedData = $request->validated();

            // Handle image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image if it exists
                if ($picEngineer->image) {
                    $oldImagePath = public_path('storage/images/pic_engineers/' . $picEngineer->image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // Process and store new image
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug($request->name) . '.' . $extension;
                $image->storeAs('images/pic_engineers', $filename, 'public');
                $validatedData['image'] = $filename;
            }

            // Handle password if provided
            if (!empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }

            // Update the user
            $picEngineer->update([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'] ?? null,
                'address' => $validatedData['address'] ?? null,
                'password' => $validatedData['password'] ?? $picEngineer->password,
                'image' => $validatedData['image'] ?? $picEngineer->image,

            ]);

            if (isset($validatedData['status'])) {
                $picEngineer->status = $validatedData['status'];
                $picEngineer->save();
            }
            if (!$picEngineer->hasRole('picEngineer')) {
                $picEngineer->assignRole('picEngineer');
            }
            return redirect()->route('picEngineers.index')
                ->with('success', 'Sales person updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update picEngineer person: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $picEngineer)
    {
        //
        try {
            // Delete the picEngineer
            $picEngineer->delete();

            // Delete the image if it exists
            if ($picEngineer->image) {
                $oldImagePath = public_path('storage/images/pic_engineers/' . $picEngineer->image);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            return redirect()->route('picEngineers.index')
                ->with('success', 'PIC Engineer deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete PIC Engineer: ' . $e->getMessage());
        }
    }
}
