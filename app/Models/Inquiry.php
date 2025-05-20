<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inquiry extends Model
{
    /** @use HasFactory<\Database\Factories\InquiryFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'inquiries';

    protected $fillable = [
        'code',
        'customer_id',
        'pic_engineer_id',
        'sales_id',
        'description',
        'quantity',
        'inquiry_date',
        'end_user_name',
        'end_user_email',
        'end_user_phone',
        'end_user_address',
        'file',
        'status',
    ];

    protected $casts = [
        'inquiry_date' => 'date',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function picEngineer()
    {
        return $this->belongsTo(User::class, 'pic_engineer_id');
    }

    public function sales()
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function purchaseOrder()
    {
        return $this->hasOne(PurchaseOrder::class);
    }
}
