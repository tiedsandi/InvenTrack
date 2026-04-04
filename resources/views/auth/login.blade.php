<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — InvenTrack</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">

        {{-- Header --}}
        <div class="bg-[#c0392b] px-6 py-6 text-center">
            <h4 class="text-white font-bold text-xl">InvenTrack</h4>
            <p class="text-white/80 text-sm mt-1">Inventory & Order Management</p>
        </div>

        {{-- Body --}}
        <div class="p-6">
            @if ($errors->any())
                <div class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}">
                @csrf

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value="{{ old('email') }}" placeholder="email@example.com"
                        required autofocus
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40
                               {{ $errors->has('email') ? 'border-red-400 bg-red-50' : 'border-gray-300' }}">
                    @error('email')
                        <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-5">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" placeholder="••••••••" required
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40
                               {{ $errors->has('password') ? 'border-red-400 bg-red-50' : 'border-gray-300' }}">
                    @error('password')
                        <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit"
                    class="w-full bg-[#c0392b] hover:bg-[#a93226] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                    Masuk
                </button>
            </form>
        </div>
    </div>
</body>

</html>
