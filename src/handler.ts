import { Router } from 'itty-router'
import { IComment, IPost, IUser } from './types'

const emptyPosts: IPost[] = []
const emptyUsers: IUser[] = []

const router = Router()

const headers = {
  'Content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

const plainTextHeaders = {
  'Content-Type': 'text/plain',
  'Access-Control-Allow-Origin': '*',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': '*',
}

const getPostsFromKV = async (): Promise<IPost[]> => {
  let data
  const cache = await POSTS.get('posts')
  if (!cache) {
    await POSTS.put('posts', JSON.stringify(emptyPosts))
    data = emptyPosts
  } else {
    data = JSON.parse(cache)
  }
  return data
}

const handleGetRequest = async (): Promise<Response> => {
  try {
    const body: IPost[] = await getPostsFromKV()
    return new Response(JSON.stringify(body), {
      headers: headers,
    })
  } catch (error) {
    let errMessage
    if (error instanceof Error) errMessage = error.message
    return new Response(errMessage, { status: 500 })
  }
}

const handlePostRequest = async (req: Request): Promise<Response> => {
  try {
    const body: IPost = await req.json()
    const posts: IPost[] = await getPostsFromKV()
    const idx = posts.findIndex((p: IPost) => p.id === body.id)
    if (idx > -1) posts[idx] = body
    else posts.push(body)
    await POSTS.put('posts', JSON.stringify(posts))
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: headers,
    })
  } catch (err) {
    let errorMessage = 'Unknown Error'
    if (err instanceof Error) errorMessage = err.message
    return new Response(errorMessage, { status: 500 })
  }
}

const getUsersFromKV = async (): Promise<IUser[]> => {
  let data
  const cache = await POSTS.get('users')
  if (!cache) {
    await POSTS.put('users', JSON.stringify(emptyUsers))
    data = emptyUsers
  } else {
    data = JSON.parse(cache)
  }
  return data
}

const handleRegister = async (req: Request): Promise<Response> => {
  try {
    const body: IUser = await req.json()
    const users: IUser[] = await getUsersFromKV()
    const userExists = users.find((u: IUser) => u.username === body.username)
    if (userExists) {
      return new Response(`${body.username} already Exists`, {
        status: 409,
        headers: plainTextHeaders,
      })
    } else {
      users.push(body)
    }
    await POSTS.put('users', JSON.stringify(users))
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    let errMessage = 'Unknown Error'
    if (error instanceof Error) errMessage = error.message
    return new Response(errMessage, { status: 500 })
  }
}

const handleLogin = async (req: Request): Promise<Response> => {
  try {
    const body: {
      username: string
      password: string
    } = await req.json()
    const users: IUser[] = await getUsersFromKV()
    const validUser = users.find(
      (u: IUser) =>
        u.username === body.username && u.password === body.password,
    )
    if (validUser) {
      return new Response(JSON.stringify(validUser), {
        status: 200,
        headers: headers,
      })
    } else {
      return new Response('Invalid credentials', {
        status: 401,
        headers: plainTextHeaders,
      })
    }
  } catch (error) {
    let errMessage = 'Unknown Error'
    if (error instanceof Error) errMessage = error.message
    return new Response(errMessage, { status: 500 })
  }
}

const handleComments = async (req: Request): Promise<Response> => {
  try {
    const body: IComment = await req.json()
    const posts = await getPostsFromKV()
    const newPosts = posts.map((p: IPost) => {
      if (p.id === body.postId) {
        p.comments[p.comments.length] = body
        return p
      } else {
        return p
      }
    })
    await POSTS.put('posts', JSON.stringify(newPosts))
    const post = newPosts.find((p: IPost) => p.id === body.postId)
    return new Response(JSON.stringify(post), {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    let errMessage = 'Unknown Error'
    if (error instanceof Error) errMessage = error.message
    return new Response(errMessage, { status: 500 })
  }
}

const handleUpdateUser = async (req: Request): Promise<Response> => {
  try {
    const body: IUser = await req.json()
    const users: IUser[] = await getUsersFromKV()
    const newUsers: IUser[] = users.map((u: IUser) => {
      if (u.id === body.id) return body
      else return u
    })
    await POSTS.put('users', JSON.stringify(newUsers))
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    let errMessage
    if (error instanceof Error) errMessage = error.message
    return new Response(errMessage, { status: 500 })
  }
}

router.get('/posts', handleGetRequest)
router.post('/posts', handlePostRequest)
router.post('/register', handleRegister)
router.post('/login', handleLogin)
router.post('/post/comments', handleComments)
router.post('/updateUser', handleUpdateUser)
router.get('*', () => new Response('Not found', { status: 404 }))

// preflight calls
router.options(
  '/post/comments',
  () => new Response('OK', { headers: corsHeaders }),
)
router.options('/posts', () => new Response('OK', { headers: corsHeaders }))
router.options('/login', () => new Response('OK', { headers: corsHeaders }))
router.options('/register', () => new Response('OK', { headers: corsHeaders }))
router.options(
  '/updateUser',
  () => new Response('OK', { headers: corsHeaders }),
)

export const handleRequest = async (req: Request): Promise<Response> =>
  router.handle(req)
