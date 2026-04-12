<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'InvenTrack API',
    version: '1.0.0',
    description: 'REST API untuk aplikasi manajemen inventori InvenTrack.'
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local Server'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/login',
        summary: 'Login dan dapatkan token',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@inventrack.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'admin123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Login berhasil'),
            new OA\Response(response: 422, description: 'Email atau password salah'),
        ]
    )]
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    #[OA\Post(
        path: '/api/logout',
        summary: 'Logout',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [new OA\Response(response: 200, description: 'Logged out')]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    #[OA\Get(
        path: '/api/user',
        summary: 'Data user yang sedang login',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [new OA\Response(response: 200, description: 'Data user')]
    )]
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
