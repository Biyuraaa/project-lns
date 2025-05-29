<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
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
        $rules = [
            'description' => 'required|string|max:2000',
            'business_unit_id' => 'required|exists:business_units,id',
            'inquiry_date' => 'required|date',
            'end_user_name' => 'nullable|string|max:255',
            'end_user_email' => 'nullable|email|max:255',
            'end_user_phone' => 'nullable|string|max:20',
            'end_user_address' => 'nullable|string|max:500',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'new_customer' => 'boolean',
            'pic_engineer_id' => 'nullable|exists:users,id',
            'sales_id' => 'nullable|exists:users,id',
        ];

        if ($this->boolean('new_customer')) {
            $rules['customer_name'] = 'required|string|max:255';
            $rules['customer_email'] = 'required|email|max:255';
            $rules['customer_phone'] = 'nullable|string|max:20';
            $rules['customer_address'] = 'nullable|string|max:500';
        } else {
            $rules['customer_id'] = 'required|exists:customers,id';
        }

        return $rules;
    }
}
