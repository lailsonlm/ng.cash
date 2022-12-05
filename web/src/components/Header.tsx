import Image from 'next/image';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function Header() {
  const { signOut } = useContext(AuthContext)
  return (
    <div className='flex fixed z-50 w-full h-16 md:h-20 items-center justify-between px-6 md:px-10 bg-black'>
      <Image src="/logo.svg" alt="" width={150} height={40} className="h-10" />

      <button
        type='button'
        onClick={signOut}
        className='border border-white rounded-full py-1 md:py-2 px-6 md:px-8 text-white hover:border-gray-300 hover:text-gray-300'
      >
        Sair
      </button>
    </div>
  )
}