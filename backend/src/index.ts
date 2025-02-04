import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
  }
}>()

// Creating middleware to check if the user is authenticated
app.use("/api/v1/blog/*", async(c, next) => {
  // get the header
  // verify the header
  // if the header is present, continue
  // if the header is not present, return 403
  const header = c.req.header('Authorization') || "";
  // Bearer token => [Bearer, token] so we get the first element which is the token
  const token = header.split(' ')[1];


  const response = await verify(header, c.env.JWT_SECRET)
  if(response.id){
    next();
  } else {
    c.status(403)
    return c.json({ error: "Unauthorized" })
  }
})

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

  const token = await sign({ id: user.id }, c.env.JWT_SECRET)

  return c.json({ token });
})

app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl:  c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  // create a new user
  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    }
  })

  if (!user) {
    c.status(403)
    return c.json({ message: 'Invalid credentials' })
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
  return c.json({ token: jwt });
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
