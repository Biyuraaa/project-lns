<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Negotiation extends Model
{
    /** @use HasFactory<\Database\Factories\NegotiationFactory> */
    use HasFactory;

    protected $fillable = [
        'file',
        'quotation_id',
        'amount',
    ];

    /**
     * Get the quotation associated with the negotiation.
     */

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}
