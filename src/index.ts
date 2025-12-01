import { Hono } from 'hono'

declare const atob: (data: string) => string

type Env = {
  Bindings: {
    BASIC_USER: string
    BASIC_PASSWORD: string
  }
}

const app = new Hono<Env>()

const credentialsAreValid = (user: string, password: string, env: Env['Bindings']) =>
  user === env.BASIC_USER && password === env.BASIC_PASSWORD

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

const decodeBasicToken = (value: string) => {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(value)
  }

  throw new Error('No hay soporte para decodificar Base64 en este entorno')
}

app.get('/', (c) => c.text('API operativa', 200, corsHeaders))

app.options('*', (c) => c.body(null, 204, corsHeaders))

app.post('/auth/login', async (c) => {
  type LoginPayload = {
    username?: string
    usuario?: string
    password?: string
    contrasena?: string
  }

  const body = await c.req.json<LoginPayload>().catch<LoginPayload>(() => ({} as LoginPayload))
  const { username, usuario, password, contrasena } = body

  const providedUser = username ?? usuario ?? ''
  const providedPassword = password ?? contrasena ?? ''

  if (!providedUser || !providedPassword) {
    return c.json({ ok: false, message: 'Usuario y contraseña son requeridos' }, 400, corsHeaders)
  }

  if (!credentialsAreValid(providedUser, providedPassword, c.env)) {
    return c.json({ ok: false, message: 'Credenciales inválidas' }, 401, corsHeaders)
  }

  return c.json({ ok: true, message: 'Inicio de sesión exitoso' }, 200, corsHeaders)
})

app.post('/auth/login-basic', (c) => {
  const header = c.req.header('Authorization') ?? ''

  if (!header.startsWith('Basic ')) {
    return c.json({ ok: false, message: 'Encabezado Authorization Basic requerido' }, 400, corsHeaders)
  }

  const decoded = decodeBasicToken(header.replace('Basic ', ''))
  const [user = '', password = ''] = decoded.split(':')

  if (!credentialsAreValid(user, password, c.env)) {
    return c.json({ ok: false, message: 'Credenciales inválidas' }, 401, corsHeaders)
  }

  return c.json({ ok: true, message: 'Inicio de sesión exitoso' }, 200, corsHeaders)
})

export default app
