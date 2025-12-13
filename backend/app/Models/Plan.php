<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'server_id',
        'duration_value',
        'duration_unit',
        'multi_server',
        'template_header',
        'template_footer',
        'status',
        'test_mode',
        'show_in_dashboard',
        'price',
        'credits',
        'order',
        'bouquets',
    ];

    protected $casts = [
        'multi_server' => 'boolean',
        'test_mode' => 'boolean',
        'show_in_dashboard' => 'boolean',
        'price' => 'decimal:2',
        'bouquets' => 'array',
    ];

    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}
