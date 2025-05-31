<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyGrowthSelling extends Model
{
    use HasFactory;
    //
    protected $table = 'company_growth_sellings';
    protected $fillable = [
        'month',
        'year',
        'target',
        'actual',
        'difference',
        'percentage',
        'business_unit_id',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'target' => 'integer',
        'actual' => 'integer',
        'difference' => 'integer',
        'percentage' => 'integer',
    ];

    public function businessUnit()
    {
        return $this->belongsTo(BusinessUnit::class);
    }
}
