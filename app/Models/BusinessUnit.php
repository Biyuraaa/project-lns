<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessUnit extends Model
{
    /** @use HasFactory<\Database\Factories\BusinessUnitFactory> */
    use HasFactory;
    protected $table = 'business_units';

    protected $fillable = [
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }

    public function companyGrowthSellings()
    {
        return $this->hasMany(CompanyGrowthSelling::class);
    }
}
