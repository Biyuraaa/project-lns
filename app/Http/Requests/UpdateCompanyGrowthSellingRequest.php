<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyGrowthSellingRequest extends FormRequest
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
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2025',
            'target' => 'required|integer|min:0',
            'actual' => 'required|integer|min:0',
        ];
    }
}
