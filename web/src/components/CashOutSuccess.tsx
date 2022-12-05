import { CheckCircle } from "phosphor-react";

interface CashOutSuccessProps {
  handleCashOutSuccess: () => void;
}

export function CashOutSuccess({ handleCashOutSuccess }: CashOutSuccessProps) {
  return (
    <>
    <div className="flex flex-col gap-2 items-center">
      <CheckCircle size={64} color="#22c55e" weight="fill" />
      <h2 className="text-xl text-center md:text-3xl uppercase font-bold">Tranferência realizada com sucesso!</h2>
    </div>
    <div className="flex mt-8 md:mt-16 w-full items-center justify-center">
      <button
        type="button"
        onClick={handleCashOutSuccess}
        className="bg-black w-full max-w-[150px] md:max-w-[200px] rounded-full text-white px-5 py-2 md:px-6 md:py-4 font-bold transition-colors hover:bg-zinc-900"
      >
        Voltar
      </button>
    </div>
    </>
  )
}