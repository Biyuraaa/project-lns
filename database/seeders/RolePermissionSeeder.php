<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        Role::create([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);
        Role::create([
            'name' => 'pic-engineer',
            'guard_name' => 'web',
        ]);
        Role::create([
            'name' => 'sales',
            'guard_name' => 'web',
        ]);
    }
}
