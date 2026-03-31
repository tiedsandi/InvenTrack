<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — Asietex App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f0f2f5;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            width: 100%;
            max-width: 420px;
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            background-color: #c0392b;
            border-radius: 12px 12px 0 0 !important;
            padding: 24px;
            text-align: center;
        }

        .card-header h4 {
            color: white;
            margin: 0;
            font-weight: 700;
        }

        .card-header p {
            color: rgba(255, 255, 255, 0.8);
            margin: 4px 0 0 0;
            font-size: 13px;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="card-header">
            <h4>ASIETEX</h4>
            <p>Sinar Indopratama — Aplikasi Manajemen</p>
        </div>
        <div class="card-body p-4">
            @if ($errors->any())
                <div class="alert alert-danger py-2">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}">
                @csrf
                <div class="mb-3">
                    <label class="form-label fw-semibold">Email</label>
                    <input type="email" name="email" class="form-control @error('email') is-invalid @enderror"
                        value="{{ old('email') }}" placeholder="email@example.com" required autofocus>
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label fw-semibold">Password</label>
                    <input type="password" name="password" class="form-control @error('password') is-invalid @enderror"
                        placeholder="••••••••" required>
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <button type="submit" class="btn w-100 text-white fw-semibold" style="background-color: #c0392b;">
                    Masuk
                </button>
            </form>
        </div>
    </div>
</body>

</html>
