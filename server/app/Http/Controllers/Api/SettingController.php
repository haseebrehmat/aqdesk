<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    private function payload(): array
    {
        $path = Setting::read('logo_path');
        $exists = $path && Storage::disk('public')->exists($path);

        return [
            'app_name' => Setting::read('app_name', 'AQDesk'),
            'logo_url' => $exists
                ? '/api/settings/logo?v='.substr(md5($path.Storage::disk('public')->lastModified($path)), 0, 10)
                : null,
        ];
    }

    /** Public branding settings (name + logo URL used as logo and favicon). */
    public function show()
    {
        return response()->json(['success' => true, 'settings' => $this->payload()]);
    }

    /** Streams the uploaded logo so it works through the API proxy. */
    public function logo()
    {
        $path = Setting::read('logo_path');
        abort_unless($path && Storage::disk('public')->exists($path), 404);

        $file = Storage::disk('public')->path($path);
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $mime = ['svg' => 'image/svg+xml', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'ico' => 'image/x-icon'][$ext] ?? 'application/octet-stream';

        return response()->file($file, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=86400',
            'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'sometimes|string|max:60',
            'logo' => 'sometimes|file|mimes:png,jpg,jpeg,webp,ico|max:2048',
            'remove_logo' => 'sometimes|boolean',
        ]);

        if (isset($validated['app_name'])) {
            Setting::write('app_name', trim($validated['app_name']));
        }

        if ($request->boolean('remove_logo') || $request->hasFile('logo')) {
            $old = Setting::read('logo_path');
            if ($old) {
                Storage::disk('public')->delete($old);
                Setting::write('logo_path', null);
            }
        }

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $path = $file->storeAs('branding', 'logo-'.time().'.'.$file->extension(), 'public');
            Setting::write('logo_path', $path);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated.',
            'settings' => $this->payload(),
        ]);
    }
}
