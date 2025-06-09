<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
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
            'code' => 'nullable|string|max:255',
            'quotation_id' => 'nullable|exists:quotations,id',
            'amount' => 'nullable|numeric',
            'status' => 'nullable|in:wip,ar,ibt,clsd',
            'contract_number' => 'nullable|string|max:255',
            'job_number' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ];
    }
}
