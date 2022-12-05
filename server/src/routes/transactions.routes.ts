import { Router } from "express";
import { z, ZodError } from "zod";
import * as jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma";
import { endOfDay, startOfDay } from 'date-fns'

const transactionsRoutes = Router();

transactionsRoutes.post("/cashout", async (request, response) => {
  const [type, token] = request.headers.authorization ? request.headers.authorization.split(' ') : ''
  
  const createCashOutBody = z.object({
    username: z.string().min(3),
    value: z.number({
      required_error: "Value is required",
      invalid_type_error: "Field must be a number",
    }).positive(),
  })

  try {
    const { username, value } = createCashOutBody.parse(request.body)
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

    const userDebitedAccount = await prisma.user.findUnique({
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
      return response.status(401).send()
    }

    if(!userDebitedAccount) {
      return response.status(404).json({ error: "User does not exists" })
    }

    if(username === user.username) {
      return response.status(400).json({ error: "It is not allowed to transfer to yourself." })
    }

    if(Number(user.account.balance) < value) {
      return response.status(400).json({ error: "Cash-out value greater than the current balance sheet value." })
    }

    const newBalanceValueCreditedAccount = Number(user.account.balance) - value
    const newBalanceValueDebitedAccount = Number(userDebitedAccount.account.balance) + value

    const updateCreditedAccount =  prisma.account.update({
      where: {
        id: user.accountId
      },
      data: {
        balance: newBalanceValueCreditedAccount,
      }
    })

    const updateDebitedAccount = prisma.account.update({
      where: {
        id: userDebitedAccount.accountId
      },
      data: {
        balance: newBalanceValueDebitedAccount,
      }
    })

    const createTransaction = prisma.transaction.create({
      data: {
        value,
        creditedAccountId: user.accountId,
        debitedAccountId: userDebitedAccount.accountId,
      }
    })

    await prisma.$transaction([updateCreditedAccount, updateDebitedAccount, createTransaction])

    return response.status(201).json({ message: "Cash-out successful!" })

  } catch (error) {
    if(error instanceof ZodError) {
      return response.status(400).json(error.message);
    }
    return response.status(400).send();
  }
})

transactionsRoutes.get("/transactions", async (request, response) => {
  const [type, token] = request.headers.authorization ? request.headers.authorization.split(' ') : ''
  const filterDate = request.query.filterDate ? request.query.filterDate : undefined
  const filterTransactionsType = request.query.filterTransactionsType

  const startOfDayFilter = startOfDay(new Date(filterDate as string))
  const endOfDayFilter = endOfDay(new Date(filterDate as string))

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub as string,
      },
      select: {
        accountId: true
      }
    })

    if(!user) {
      return response.status(404).json({ error: "User does not exist." })
    }

    const userTransactions = await prisma.user.findUnique({
      where: {
        accountId: user.accountId,
      },
      select: {
        account: {
          include: {
            transactionDebited: {
              where: {
                accountDebited: {
                  user: {
                    accountId: {
                      not: filterTransactionsType === "cashOut" ? user.accountId : undefined,  
                    }
                  },
                },
                createdAt: filterDate ? {
                  gte: startOfDayFilter,
                  lt:  endOfDayFilter
                } : {},
              },
              include: {
                accountCredited: {
                  select: {
                    user: {
                      select: {
                        username: true,
                      }
                    }
                  }
                }
              }
            },
            transactionCredited: {
              where: {
                accountCredited: {
                  user: {
                    accountId: {
                      not: filterTransactionsType === "cashIn" ? user.accountId : undefined,  
                    }
                  }
                },
                createdAt: filterDate ? {
                  gte: startOfDayFilter,
                  lt:  endOfDayFilter
                } : {},
              },
              include: {
                accountDebited: {
                  select: {
                    user: {
                      select: {
                        username: true,
                      }
                    }
                  }
                }
              }
            },
          },
        }
      }
    })


    if(!userTransactions) {
      return response.status(404).json({ error: "User has no transaction." })
    }

    return response.status(200).json(userTransactions)

  } catch (error) {
    if(error instanceof ZodError) {
      return response.status(400).json(error.message);
    }
    return response.status(400).send();
  }
})

export { transactionsRoutes };