<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Welcome/Index');
    }

    public function about()
    {
        return Inertia::render('About/Index');
    }

    public function services()
    {
        return Inertia::render('Services/Index');
    }
}
