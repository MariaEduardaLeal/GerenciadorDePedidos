<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderLog;
use App\Models\Products;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('orderItems.product')->get();
        return view('orders.index', compact('orders'));
    }

    public function create()
    {
        $products = Products::all();
        return view('orders.create', compact('products'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'observation' => 'nullable|string',
        ]);

        // Criar o pedido
        $order = Order::create([
            'user_id' => Auth::id(),
            'total_price' => 0,
            'status' => 'in_progress',
            'observation' => $request->observation,
        ]);

        // Adicionar os itens ao pedido e calcular o total
        $totalPrice = 0;
        foreach ($request->products as $item) {
            $product = Products::find($item['id']);
            $quantity = $item['quantity'];
            $subtotal = $product->price * $quantity;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ]);

            $totalPrice += $subtotal;
        }

        // Atualizar o preço total do pedido
        $order->update(['total_price' => $totalPrice]);

        // Registrar o log de criação
        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => Auth::id(),
            'action' => 'created',
            'details' => 'Pedido criado',
        ]);

        return redirect()->route('orders.index')->with('success', 'Pedido criado com sucesso!');
    }

    public function show(Order $order)
    {
        $order->load('orderItems.product', 'orderLogs.user');
        return view('orders.show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:in_progress,completed,canceled',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        OrderLog::create([
            'order_id' => $order->id,
            'user_id' => Auth::id(),
            'action' => 'status_updated',
            'details' => "Status alterado de {$oldStatus} para {$request->status}",
        ]);

        return redirect()->back()->with('success', 'Status do pedido atualizado!');
    }
}
