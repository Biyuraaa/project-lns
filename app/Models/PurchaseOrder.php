<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    /** @use HasFactory<\Database\Factories\PurchaseOrderFactory> */
    use HasFactory;

    protected $table = 'purchase_orders';

    protected $fillable = [
        'code',
        'quotation_id',
        'amount',
        'status',
        'contract_number',
        'job_number',
        'file',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'integer',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}
