import { GetServerSideProps } from "next/types";
import { parseCookies } from "nookies";
import { CircleNotch, Eye, EyeSlash, Wallet } from "phosphor-react";
import { useContext, useState } from "react";
import { CashOutSuccess } from "../components/CashOutSuccess";
import { Footer } from "../components/Footer";
import { FormCashOut } from "../components/FormCashOut";
import { Header } from "../components/Header";
import { TransactionsTable } from "../components/TransactionsTable";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user, isLoading } = useContext(AuthContext)
  const [cashOutIsSuccess, setCashOutIsSucess] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const valueBalanceFormated = Number(user?.account.balance).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})

  function handleCashOutSuccess() {
    setCashOutIsSucess(!cashOutIsSuccess)
  }

  return (
    <div className="flex w-full flex-col items-center">
      <Header />
      
      <div className="flex flex-col w-full mt-16 md:mt-20 max-w-5xl pb-16 md:pb-32 px-4 lg:px-1 xl:px-0">
        {isLoading ? 
          <CircleNotch 
            size={24}
            weight="bold" 
            className="animate-spin text-black mt-10" 
          />
          :
          <p className="text-sm md:text-lg mt-10">Olá, <strong>@{user?.username}</strong>.</p>         
        }

        <div className="flex flex-col gap-3 mt-10">
          <div className="flex gap-2 items-center">
            <h2 className="text-xl md:text-3xl uppercase font-bold">Carteira</h2>
            <Wallet size={32} color="#000" weight="fill" className="w-6 md:w-8" />
          </div>
          
          <div className="flex w-full max-w-sm bg-black text-white rounded-3xl px-4 py-2 items-center justify-between relative">
            <p className="text-sm md:text-base">Saldo disponível</p>
            <strong className="text-sm md:text-base pr-8">
              {isLoading ?          
              <CircleNotch 
                size={24}
                weight="bold" 
                className="animate-spin text-white" 
              /> 
              : showBalance ? valueBalanceFormated : 'R$ --,--'}
            </strong>       
            <button 
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 outline-none"
                onClick={() => setShowBalance(!showBalance)}
                disabled={isLoading}
              >
                {showBalance ? 
                  <EyeSlash className="text-gray-200 w-4 md:w-5" weight="bold" size={20}/>
                  : 
                  <Eye className="text-gray-200 w-4 md:w-5" weight="bold" size={20}/>
                }
                
              </button>
          </div>
        </div>

        <div className="flex flex-col mt-16 md:mt-32">
          {cashOutIsSuccess ? 
            <CashOutSuccess handleCashOutSuccess={handleCashOutSuccess} />
            :
            <FormCashOut balance={user?.account.balance} handleCashOutSuccess={handleCashOutSuccess} />
          }
          
        </div>

        <div className="flex flex-col mt-16 md:mt-32">
          <TransactionsTable cashOutIsSuccess={cashOutIsSuccess} />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = parseCookies(context);
  const token = cookies['ngcash.token']

  if(!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  return {
    props: {},
  }
}
