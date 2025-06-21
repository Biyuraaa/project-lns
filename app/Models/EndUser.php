<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EndUser extends Model
{
    /** @use HasFactory<\Database\Factories\EndUserFactory> */
    use HasFactory;

    protected $table = 'end_users';

    protected $fillable = [
        'inquiry_id',
        'name',
        'email',
        'phone',
        'address',
        'position',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the inquiry that owns the end user.
     */
    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class);
    }
}
