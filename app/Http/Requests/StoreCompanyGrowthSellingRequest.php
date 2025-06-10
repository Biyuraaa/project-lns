<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreCompanyGrowthSellingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return $user->hasPermissionTo('create-company-growth-selling');
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
            'year' => 'required|integer|min:2000|max:2050',
            'uniformTarget' => 'required_if:useUniformTargets,true|nullable|numeric|min:0',
            'businessUnitTargets' => 'required_if:useUniformTargets,false|array',
            'businessUnitTargets.*' => 'required_if:useUniformTargets,false|numeric|min:0',
            'useUniformTargets' => 'required|boolean',
        ];
    }
}
