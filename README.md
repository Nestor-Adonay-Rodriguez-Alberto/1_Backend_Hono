```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Variables para el login

Este Worker valida las credenciales contra dos variables de entorno:

```jsonc
// wrangler.jsonc
"vars": {
	"BASIC_USER": "admin",
	"BASIC_PASSWORD": "123456"
}
```

Para producción es mejor almacenar la contraseña con `wrangler secret put BASIC_PASSWORD` y eliminarla del archivo de configuración.

## Endpoints disponibles

- `POST /auth/login`: espera JSON `{ "username": "admin", "password": "123456" }` (también acepta las claves `usuario` y `contrasena`).
- `POST /auth/login-basic`: requiere el encabezado `Authorization: Basic base64(usuario:contrasena)` para simplificar integraciones que ya usan Basic Auth.
- `GET /`: simple ping para saber que el Worker está activo.
- `OPTIONS *`: responde `204` y sirve para el preflight de CORS.

Ejemplo con `fetch` desde el front:

```ts
await fetch('https://<tu-worker>.workers.dev/auth/login', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ username: 'admin', password: '123456' })
})
```

> El Worker agrega encabezados `Access-Control-Allow-*` (por defecto con `'*'`) para que puedas llamar desde `localhost:4321` o Cloudflare Pages. Cambia ese valor en `src/index.ts` si quieres restringirlo a un origen específico.

Si la respuesta contiene `{ ok: true }`, permite el acceso a la pantalla de inicio; en cualquier otro caso muestra el mensaje de error.
