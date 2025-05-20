<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quotation extends Model
{
    /** @use HasFactory<\Database\Factories\QuotationFactory> */
    use HasFactory;

    protected $table = 'quotations';

    protected $fillable = [
        'code',
        'inquiry_id',
        'status',
        'file',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function negotiations()
    {
        return $this->hasMany(Negotiation::class);
    }
}
