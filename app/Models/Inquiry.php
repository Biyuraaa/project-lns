<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Inquiry extends Model
{
    /** @use HasFactory<\Database\Factories\InquiryFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'inquiries';

    protected $fillable = [
        'code',
        'customer_id',
        'pic_engineer_id',
        'business_unit_id',
        'sales_id',
        'description',
        'inquiry_date',
        'end_user_name',
        'end_user_email',
        'end_user_phone',
        'end_user_address',
        'file',
        'due_date',
        'status',
    ];

    protected $casts = [
        'inquiry_date' => 'date',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate code before creating
        static::creating(function ($inquiry) {
            if (!$inquiry->code) {
                $date = Carbon::parse($inquiry->inquiry_date ?: now());
                $romanMonth = self::monthToRoman($date->month);
                $year = $date->year;

                // Generate a temporary code, will be updated after save
                $inquiry->code = "tmp/I/LNS/{$romanMonth}/{$year}";
            }
        });

        // Update code after creating with the real ID
        static::created(function ($inquiry) {
            $date = Carbon::parse($inquiry->inquiry_date ?: now());
            $romanMonth = self::monthToRoman($date->month);
            $year = $date->year;

            $inquiry->code = "{$inquiry->id}/I/LNS/{$romanMonth}/{$year}";
            $inquiry->save();
        });
    }

    private static function monthToRoman(int $month): string
    {
        $romans = [
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            5 => 'V',
            6 => 'VI',
            7 => 'VII',
            8 => 'VIII',
            9 => 'IX',
            10 => 'X',
            11 => 'XI',
            12 => 'XII'
        ];

        return $romans[$month];
    }

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

    public function quotation()
    {
        return $this->hasOne(Quotation::class);
    }

    public function businessUnit()
    {
        return $this->belongsTo(BusinessUnit::class);
    }
}
