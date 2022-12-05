import { NextFunction, Request, Response } from "express"
import { prisma } from "../lib/prisma"

export async function checksExistsUserAccount(request: Request, response: Response, next: NextFunction) {
  const { username } = request.body

  console.log(request.body)

  if(!username) {
    return response.status(400).send()
  }

  const usernameExists = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if(usernameExists) {
    return response.status(409).json({ error: "User already exists" })
  }

  return next()
}