<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Quotation extends Model
{
    /** @use HasFactory<\Database\Factories\QuotationFactory> */
    use HasFactory;

    protected $table = 'quotations';

    protected $fillable = [
        'code',
        'status',
        'due_date',
        'inquiry_id',
        'file',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate or update code when a quotation attribute changes
        static::saved(function ($quotation) {
            $quotation->updateQuotationCode();
        });
    }
    /**
     * 
     * @param int $month
     * @return string
     */
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

    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function negotiations()
    {
        return $this->hasMany(Negotiation::class);
    }

    public function purchaseOrder()
    {
        return $this->hasOne(PurchaseOrder::class);
    }

    /**
     * Update quotation code based on negotiation count
     */
    public function updateQuotationCode()
    {
        if (!$this->inquiry) {
            return;
        }

        $date = Carbon::parse($this->created_at ?: now());
        $month = $date->month;
        $year = $date->year;
        $romanMonth = self::monthToRoman($month);

        $negotiationCount = $this->negotiations()->count();
        $qPrefix = $negotiationCount > 0 ? "Q{$negotiationCount}" : "Q";

        $newCode = "{$this->inquiry->id}/{$qPrefix}/LNS/{$romanMonth}/{$year}";

        if ($this->code !== $newCode) {
            $this->code = $newCode;
            $this->saveQuietly(); // Use saveQuietly to avoid infinite loop
        }
    }
}
