<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StorePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return $user->hasPermissionTo('create-purchase-order');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'code' => 'nullable|string|max:50|unique:purchase_orders,code',
            'quotation_id' => 'nullable|exists:quotations,id',
            'amount' => 'nullable|integer|min:1',
            'status' => 'nullable|string|in:wip,ar,ibt',
            'contract_number' => 'nullable|string|max:50',
            'job_number' => 'nullable|string|max:50',
            'date' => 'nullable|date',
        ];
    }
}
