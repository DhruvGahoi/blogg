import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { sign } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,WT
  }
}>()

app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl:  c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  // create a new user
  const body = await c.req.json();
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    }
  })

  const token = sign({ id: user.id }, c.env.JWT_SECRET)

  return c.json({ token });
})

app.post('/api/v1/signin', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

export default app
