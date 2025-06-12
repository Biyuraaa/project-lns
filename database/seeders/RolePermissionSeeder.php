<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $models = [
            'customer',
            'sales',
            'pic-engineer',
            'inquiry',
            'quotation',
            'negotiation',
            'purchase-order',
            'user',
            'company-growth-selling'
        ];

        $allPermissions = [];
        foreach ($models as $model) {
            $permissionNames = [
                'view-any-' . $model,
                'view-' . $model,
                'create-' . $model,
                'update-' . $model,
                'delete-' . $model
            ];

            $permissionNames[] = 'view-dashboard';

            foreach ($permissionNames as $permissionName) {
                Permission::firstOrCreate(['name' => $permissionName]);
                $allPermissions[] = $permissionName;
            }
        }

        $direkturRole = Role::firstOrCreate(['name' => 'Direktur']);
        $salesRole = Role::firstOrCreate(['name' => 'Sales']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);

        $salesPermissions = [
            'view-any-customer',
            'view-customer',
            'create-customer',
            'update-customer',
            'view-any-inquiry',
            'view-inquiry',
            'create-inquiry',
            'update-inquiry',
            'view-any-quotation',
            'view-quotation',
            'create-quotation',
            'update-quotation',
            'view-any-purchase-order',
            'view-purchase-order',
            'create-purchase-order',
            'update-purchase-order',
        ];

        $salesRole->syncPermissions($salesPermissions);
        $direkturRole->syncPermissions($allPermissions);
        $adminRole->syncPermissions($allPermissions);

        if (User::where('email', 'direktur@example.com')->doesntExist()) {
            $direkturUser = User::create([
                'name' => 'Direktur',
                'email' => 'direktur@example.com',
                'password' => Hash::make('password123'),
            ]);
            $direkturUser->assignRole($direkturRole);
        }

        if (User::where('email', 'sales@example.com')->doesntExist()) {
            $salesUser = User::create([
                'name' => 'Sales Person',
                'email' => 'sales@example.com',
                'password' => Hash::make('password123'),
            ]);
            $salesUser->assignRole($salesRole);
        }

        if (User::where('email', 'admin@example.com')->doesntExist()) {
            $adminUser = User::create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'),
            ]);
            $adminUser->assignRole($adminRole);
        }
    }
}
