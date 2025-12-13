<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Server extends Model
{
    protected $fillable = [
        'name',
        'type',
        'url',
        'api_key',
        'api_version',
        'use_proxy',
        'status',
        'save_action',
        'primary_dns',
        'random_dns',
        'reseller_group_id',
        'order',
        'timezone',
        'default_password',
        'allowed_bouquets',
        'max_connections',
        'max_clients',
        'template'
    ];

    protected $casts = [
        'use_proxy' => 'boolean',
        'allowed_bouquets' => 'array',
        'max_connections' => 'integer',
        'max_clients' => 'integer',
        'order' => 'integer'
    ];

    protected $hidden = [
        'api_key'
    ];
}
