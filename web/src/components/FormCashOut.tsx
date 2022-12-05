import { useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import { ArrowsLeftRight, CircleNotch } from "phosphor-react";
import { parseCookies } from "nookies";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

interface FormCashOutProps {
  balance: string | undefined;
  handleCashOutSuccess: () => void;
}

export function FormCashOut({ balance, handleCashOutSuccess }: FormCashOutProps) {
  const { getUser } = useContext(AuthContext)
  const [username, setUsername] = useState("")
  const [valueCashOut, setValueCashOut] = useState("0")
  const [confirmUsername, setConfirmUsername] = useState(false)
  const [isInsufficientValue, setIsInsufficientValue] = useState(false)
  const cookies = parseCookies()

  const value = Number(valueCashOut.replace(/[^0-9]/g, '')) / 100

  useEffect(() => {
    if(value > Number(balance)) {
      formik.setStatus('Valor informado maior do que o valor disponível em carteira.')

      setIsInsufficientValue(true)

      return
    }

    setIsInsufficientValue(false)
    formik.setStatus(null)
  }, [value, balance])
  
  function formatValueCashOut(value: any) {
    var valueFormat = value;

    valueFormat = valueFormat + '';
    valueFormat = parseInt(valueFormat.replace(/[\D]+/g, ''));
    valueFormat = valueFormat + '';
    valueFormat = valueFormat.replace(/([0-9]{2})$/g, ",$1");

    if (valueFormat.length > 6) {
        valueFormat = valueFormat.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
    }

    value = valueFormat;
    if(valueFormat == 'NaN') value = '';

    setValueCashOut(value)
  }

  const formik = useFormik({
    onSubmit: async () => {
      try {
        await api.post("/cashout", {
          username: username.toLowerCase(), 
          value
        }, {
          headers: {
            Authorization: `Bearer ${cookies['ngcash.token']}`
          }
        })

        setUsername("")
        setValueCashOut("0")
        handleCashOutSuccess()
        await getUser()

      } catch (error) {
        console.log(error)
        if(error instanceof AxiosError) {
          if(error.response?.data.error === "It is not allowed to transfer to yourself.") {
            formik.setStatus('Não é permitido transferir para si mesmo.')
          } else if (error.response?.data.error === "User does not exists") {
            formik.setStatus('Usuário não existe, favor informar um username válido!')
          } else if (error.response?.data.error === "Cash-out value greater than the current balance sheet value.") {
            formik.setStatus('Valor informado maior do que o valor disponível em carteira.')
          } else {
            formik.setStatus('Falha ao realizar transferência, tente novamente!')
          }
        }
      }
    },
    validateOnMount: true,
    initialValues: {}
  })

  return (
    <>
    <div className="flex gap-2 items-center">
      <h2 className="text-xl md:text-3xl uppercase font-bold">Realizar Tranferência</h2>
      <ArrowsLeftRight size={32} color="#000" weight="fill" className="w-6 md:w-8" />
    </div>
    
    <p className="text-sm md:text-base">Digite o username para o qual deseja transferir.</p>
    <form onSubmit={formik.handleSubmit} className="flex flex-col mt-10">
      {formik.status && <p className="text-red-500 text-sm text-center">{formik.status}</p>}
      <div className="flex flex-col gap-2 items-end">
        <label 
          htmlFor="username"
          className="w-full text-xs md:text-sm text-gray-800"
        >
          Username
        </label>
        <input 
          type="text" 
          id="username"
          placeholder="Digite o username de quem sofrerá o cash-in"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            if(!username) {
              formik.setStatus(null)
              setConfirmUsername(false)
              setValueCashOut("0")
            }
          }}
          className="w-full border border-black py-2 md:py-3 px-3 md:px-6 rounded-full text-sm md:text-lg placeholder:text-gray-500 text-black focus:outline-zinc-900"
        />
        {confirmUsername && username ? '' :
          <button 
            type="button"
            disabled={!username}
            onClick={() => setConfirmUsername(true)}
            className="bg-black w-full rounded-full max-w-[150px] md:max-w-[200px] text-white px-5 py-2 md:px-6 md:py-4 font-bold transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>    
        }
      </div>

      {confirmUsername && username && 
        <div className="flex flex-col gap-2 items-end mt-4">
          <label 
            htmlFor="valueCashOut"
            className="w-full text-xs md:text-sm text-gray-800"
          >
            Valor da Transferência
          </label>
          <input 
            type="text" 
            maxLength={9}
            id="valueCashOut"
            placeholder="1,0"
            onChange={(e) => formatValueCashOut(e.target.value)}
            value={valueCashOut}
            className="w-full border border-black py-2 md:py-3 px-3 md:px-6 rounded-full text-sm md:text-lg placeholder:text-gray-500 text-black focus:outline-zinc-900"
          />
          <button 
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting || valueCashOut === "0" || isInsufficientValue}
            className="bg-black w-full max-w-[150px] md:max-w-[200px] rounded-full text-white px-5 py-2 md:px-6 md:py-4 font-bold transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {
            formik.isSubmitting ? 
              <CircleNotch 
                size={24}
                weight="bold" 
                className="animate-spin text-white mx-auto" 
              /> 
              : 'Transferir'
            } 
          </button>
        </div>
      }
      
    </form>
    </>
  )
}