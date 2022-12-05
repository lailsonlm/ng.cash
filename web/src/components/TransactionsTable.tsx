import { parseCookies } from "nookies";
import format from "date-fns/format";
import { CircleNotch, CurrencyDollar } from "phosphor-react";
import { useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

interface UserTransactionsProps {
  id: string;
  balance: string;
  transactionDebited: {
    id: string;
    value: string;
    debitedAccountId: string;
    creditedAccountId: string;
    createdAt: string;
    accountCredited: {
      user: {
        username: string;
      }
    }
  }[];
  transactionCredited: {
    id: string;
    value: string;
    debitedAccountId: string;
    creditedAccountId: string;
    createdAt: string;
    accountDebited: {
      user: {
        username: string;
      }
    }
  }[]
}

interface TransactionsTableProps {
  cashOutIsSuccess: boolean
}

export function TransactionsTable({ cashOutIsSuccess }: TransactionsTableProps) {
  const { isLoading } = useContext(AuthContext)
  const [transactions, setTransactions] = useState<UserTransactionsProps | null>(null)
  const [transactionsType, setTransactionsType] = useState("all")
  const [transactionsDate, setTransactionsDate] = useState("all")
  const cookies = parseCookies()

  const transactionCredited = transactions?.transactionCredited.map(({ accountDebited, ...rest }) => ({
    ...rest,
    account: accountDebited,
    type: 'credit'
  }))

  const transactionDebited = transactions?.transactionDebited.map(({ accountCredited, ...rest }) => ({
    ...rest,
    account: accountCredited,
    type: 'debit'
  }))

  const transactionsConcated = transactionDebited && transactionCredited ? [...transactionCredited, ...transactionDebited] : transactionDebited ? transactionDebited : transactionCredited

  const transactionsFormated = transactionsConcated?.sort((x, y) => {
    let a = new Date(x.createdAt) as any
    let b = new Date(y.createdAt) as any

    return a - b
  })

  const transactionsDateToISO = transactionsFormated?.map(item => format(new Date(item.createdAt), "dd/MM/yyyy"));
  
  const dateFilter = transactionsDateToISO?.filter( function( elem, index, array ) {
    return array.indexOf( elem ) === index;
} );

  const transactionsFilterByDate = transactionsFormated?.filter(transaction => transactionsDate === format(new Date(transaction.createdAt), "dd/MM/yyyy"))

  async function getAllTransactions() {
    const response = await api.get("/transactions", {
      params: {
        filterTransactionsType: transactionsType === "cashOut" ? "cashOut" : transactionsType === "cashIn" ? "cashIn" : "",
      },
      headers: {
        Authorization: `Bearer ${cookies['ngcash.token']}`
      }
    })

    setTransactions(response.data.account)
  }

  useEffect(() => {
    if(cashOutIsSuccess) {
      getAllTransactions()
    }
  }, [cashOutIsSuccess])

  useEffect(() => {
    getAllTransactions()
  }, [transactionsType])

  return (
    <>
    <div className="flex gap-2 items-center">
      <h2 className="text-xl md:text-3xl uppercase font-bold">Histórico de Transações</h2>
      <CurrencyDollar size={32} color="#000" weight="fill" className="w-6 md:w-8" />
    </div>
      <p className="text-sm md:text-base">Confira suas transações e realize os filtros abaixo para ajudar na busca.</p>
      
      <div className="flex gap-5 items-center justify-end w-full mt-4">
        <div className="flex flex-col items-end justify-center">
          <label htmlFor="transactionsType" className="block mb-2 text-xs md:text-sm font-medium text-gray-900 dark:text-white">Tipo de transação:</label>
          <select 
            id="transactionsType" 
            onChange={e => setTransactionsType(e.target.value)}
            value={transactionsType}
            className="flex border border-black py-1 px-4 rounded-full text-xs md:text-sm placeholder:text-gray-500 text-black focus:outline-zinc-900"
          >
            <option value="all">Todas</option>
            <option value="cashIn">Cash-in</option>
            <option value="cashOut">Cash-out</option>
          </select>
        </div>
        <div className="flex flex-col items-end justify-center">
          <label htmlFor="transactionsDate" className="block mb-2 text-xs md:text-sm font-medium text-gray-900 dark:text-white">Data da transação:</label>
          <select 
            id="transactionsDate" 
            onChange={e => setTransactionsDate(e.target.value)}
            value={transactionsDate}
            className="flex border border-black py-1 px-4 rounded-full text-xs md:text-sm placeholder:text-gray-500 text-black focus:outline-zinc-900"
          >
            <option value="all">Todas</option>
            {dateFilter?.map((transaction, key) => {
              return (
                <option value={transaction} key={key}>{transaction}</option>
              )
            })}
          </select>
        </div>
      </div>
      {isLoading ? 
        <CircleNotch 
          size={24}
          weight="bold" 
          className="animate-spin text-black mx-auto mt-3" 
        />
        :
        (
        transactionsConcated && transactionsConcated?.length > 0 ? 
          <div className="flex justify-center w-full overflow-scroll md:overflow-hidden mt-3">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="bg-black text-sm md:text-base text-white px-4 py-2 text-left">Usuário</th>
                  <th className="bg-black text-sm md:text-base text-white px-4 py-2 text-left">Valor</th>
                  <th className="bg-black text-sm md:text-base text-white px-4 py-2 text-left">Data</th>
                </tr>
              </thead>
    
              <tbody>
                {transactionsDate !== "all" ? 
                  transactionsFilterByDate?.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="bg-gray-200 px-4 py-2 text-sm md:text-base">{transaction.account.user.username}</td>
                      <td className={`bg-gray-200 px-4 py-2 font-semibold text-sm md:text-base ${transaction.type === "debit" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "credit" && '- '} {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                          }).format(Number(transaction.value))}
                      </td>
                      <td className="bg-gray-200 px-4 py-2 text-sm md:text-base">
                        {format(new Date(transaction.createdAt), "dd/MM/yyyy")}
                      </td>
                    </tr>
                  ))
                  :
                  transactionsFormated?.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="bg-gray-200 px-4 py-2 text-sm md:text-base">{transaction.account.user.username}</td>
                      <td className={`bg-gray-200 px-4 py-2 font-semibold text-sm md:text-base ${transaction.type === "debit" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "credit" && '- '} {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                          }).format(Number(transaction.value))}
                      </td>
                      <td className="bg-gray-200 px-4 py-2 text-sm md:text-base">
                        {format(new Date(transaction.createdAt), "dd/MM/yyyy")}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          :
          <p className="text-lg text-center mt-3">Nenhuma transação encontrada até o momento!</p>
        )
      }
    </>
  )
}