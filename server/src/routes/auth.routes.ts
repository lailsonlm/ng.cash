import { Router } from "express";
import { z, ZodError } from "zod";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma";
import { checksExistsUserAccount } from "../middlewares/authenticate";

const authRoutes = Router();

authRoutes.post("/signup", checksExistsUserAccount, async (request, response) => {
  var passwordRegexValidation = /((?=.*\d))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/g;

  const createUserBody = z.object({
    username: z.string().min(3),
    password: z.string().min(8).regex(passwordRegexValidation, { message: "The password must have at least one number and one capital letter."}),
  })
  
  try {
    const { username, password } = createUserBody.parse(request.body)

    const saltRounds = 10

    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: passwordHash,
        account: {
          create: {
            balance: 100
          }
        }
      },
      select: {
        id: true,
        username: true,
        accountId: true,
        account: {
          select: {
            balance: true
          }
        }
      }
    })

    const accessToken = jwt.sign({
      sub: user.id,
    }, process.env.JWT_SECRET as string, {
      expiresIn: '24h'
    })
  
    return response.status(201).json({
      user,
      accessToken
    });

  } catch (error) {
    if(error instanceof ZodError) {
      return response.status(400).json(error.message);
    }
    return response.status(400);
  }

});

authRoutes.get("/login", async (request, response) => {
  const [type, token] = request.headers.authorization ? request.headers.authorization.split(' ') : ''
  const [username, plainTextPassword] = Buffer.from(token, 'base64').toString().split(':')
  
  const user = await prisma.user.findUnique({
    where: {
      username
    },
    select: {
      id: true,
      username: true,
      accountId: true,
      password: true,
      account: {
        select: {
          balance: true
        }
      }
    }
  })

  if(!user) {
    return response.status(404).json({ error: "User does not exists" })
  }

  const passwordMatch = bcrypt.compareSync(plainTextPassword, user.password)
  
  if(!passwordMatch) {
    return response.status(404).json({ error: "Invalid Password" })
  }

  const accessToken = jwt.sign({
    sub: user.id,
  }, process.env.JWT_SECRET as string, {
    expiresIn: '24h'
  })

  return response.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      accountId: user.accountId,
      account: {
        balance: user.account.balance
      }
    },
    accessToken
  });


});

authRoutes.get("/user", async (request, response) => {
  const [type, token] = request.headers.authorization ? request.headers.authorization.split(' ') : ''

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub as string
      },
      select: {
        id: true,
        username: true,
        accountId: true,
        password: true,
        account: {
          select: {
            balance: true
          }
        }
      }
    })

    if(!user) {
      return response.status(401).send()
    }

    return response.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        accountId: user.accountId,
        account: {
          balance: user.account.balance
        }
      },
      accessToken: token
    });

  } catch (error) {
    return response.status(404).send()
  }
});


export { authRoutes };
