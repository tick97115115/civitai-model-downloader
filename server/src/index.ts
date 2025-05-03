import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { trpcServer } from '@hono/trpc-server' // Deno 'npm:@hono/trpc-server'
import { appRouter } from './trpc'

const app = new Hono()

app.use('/*', cors())

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
  })
)

export default app

serve({
  fetch: app.fetch,
  port: 8787,
}, (info) => {
  console.log(`server runs at: ${info.address}:${info.port}`)
})
