<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Negotiation extends Model
{
    /** @use HasFactory<\Database\Factories\NegotiationFactory> */
    use HasFactory;

    protected $table = 'negotiations';

    protected $fillable = [
        'quotation_id',
        'code',
        'file',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}
