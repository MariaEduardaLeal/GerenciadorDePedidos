<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    protected $fillable = ['name', 'description', 'price', 'photo'];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
