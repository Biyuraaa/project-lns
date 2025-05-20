<?php

namespace App\Http\Controllers;

use App\Models\Negotiation;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNegotiationRequest;
use App\Http\Requests\UpdateNegotiationRequest;
use Inertia\Inertia;

class NegotiationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $negotiations = Negotiation::select('negotiations.*')
            ->with([
                'quotation:id,code,inquiry_id',
                'quotation.inquiry:id,code,customer_id',
                'quotation.inquiry.customer:id,name,email',
            ])
            ->get();

        return Inertia::render('Dashboard/Negotiations/Index', [
            'negotiations' => $negotiations
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
    public function store(StoreNegotiationRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Negotiation $negotiation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Negotiation $negotiation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNegotiationRequest $request, Negotiation $negotiation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Negotiation $negotiation)
    {
        //
    }
}
