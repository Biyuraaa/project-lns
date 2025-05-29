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
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::created(function ($negotiation) {
            $negotiation->quotation->updateQuotationCode();
        });

        // Update quotation code when a negotiation is deleted
        static::deleted(function ($negotiation) {
            $negotiation->quotation->updateQuotationCode();
        });
    }

    /**
     * Get the quotation associated with the negotiation.
     */

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}
