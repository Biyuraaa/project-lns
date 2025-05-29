<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'code' => 'required|string|max:50|unique:purchase_orders,code',
            'quotation_id' => 'required|exists:quotations,id',
            'amount' => 'required|integer|min:1',
            'status' => 'required|string|in:wip,ar,ibt,clsd',
            'contract_number' => 'nullable|string|max:50',
            'job_number' => 'nullable|string|max:50',
            'date' => 'nullable|date',
        ];
    }
}
