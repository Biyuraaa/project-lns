<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePicEngineerRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdatePicEngineerRequest;
use Illuminate\Support\Facades\Auth;
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('view-any-pic-engineer')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to view PIC Engineers.');
        }
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('create-pic-engineer')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to create PIC Engineers.');
        }
        return Inertia::render('Dashboard/PicEngineers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePicEngineerRequest $request)
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('update-pic-engineer')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to edit PIC Engineers.');
        }
        return Inertia::render('Dashboard/PicEngineers/Edit', [
            'pic_engineer' => $picEngineer
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePicEngineerRequest $request, User $picEngineer)
    {
        try {
            $validatedData = $request->validated();
            if ($request->hasFile('image')) {
                if ($picEngineer->image) {
                    $oldImagePath = public_path('storage/images/pic_engineers/' . $picEngineer->image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                $image = $request->file('image');
                $extension = $image->getClientOriginalExtension();
                $filename = Str::slug($request->name) . '.' . $extension;
                $image->storeAs('images/pic_engineers', $filename, 'public');
                $validatedData['image'] = $filename;
            }
            if (!empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }
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
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPermissionTo('delete-pic-engineer')) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to delete PIC Engineers.');
        }
        try {
            $picEngineer->delete();
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
