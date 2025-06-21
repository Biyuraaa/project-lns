<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return $user->hasPermissionTo('update-inquiry');
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
            'code' => 'required|string|max:50|unique:inquiries,code,' . $this->inquiry->id,
            'customer_id' => 'required|exists:customers,id',
            'pic_engineer_id' => 'nullable|exists:users,id',
            'sales_id' => 'nullable|exists:users,id',
            'description' => 'required|string|max:2000',
            'business_unit_id' => 'required|exists:business_units,id',
            'inquiry_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:inquiry_date',
            'endUsers' => 'nullable|array',
            'endUsers.*.name' => 'nullable|string|max:255',
            'endUsers.*.email' => 'nullable|email|max:255',
            'endUsers.*.phone' => 'nullable|string|max:20',
            'endUsers.*.address' => 'nullable|string|max:500',
            'status' => 'required|in:pending,process,canceled',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ];
    }
}
