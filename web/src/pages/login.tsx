import { useContext, useEffect, useState } from 'react';
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CircleNotch, Eye, EyeSlash } from "phosphor-react";
import { useFormik } from "formik";
import * as yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { GetServerSideProps } from 'next/types';
import { parseCookies } from 'nookies';

const validationSchema = yup.object({
  username: yup.string().required('Campo obrigatório'),
  password: yup.string().required('Campo obrigatório'),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { user, signIn } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if(user) {
      router.push("/")
    }
  }, [user])

  const formik = useFormik({
    onSubmit: async ({ username, password }) => {
      try {
        await signIn(username, password)
      } catch (error) {
        formik.setStatus('Usuário ou senha inválido!')
      }
    },
    validationSchema,
    validateOnMount: true,
    initialValues: {
      username: '',
      password: '',
    }
  })

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-black text-white">
      <div className='md:flex-1 py-6 md:py-0 flex flex-col items-center justify-center gap-8 md:gap-14'>
        <div className='flex px-6 md:px-10'>
          <Image src="/logo.svg" alt="" width={150} height={98} className="w-20 md:w-[150px]" />
        </div>
        <div className='flex flex-col gap-0 md:gap-2 px-6 md:px-10'>
          <h1 className='font-bold text-center md:text-left text-xl md:text-4xl lg:text-5xl'>A CARTEIRA DA NOVA GERAÇÃO.</h1>
          <p className='font-light text-center md:text-left text-md md:text-2xl lg:text-3xl'>É para todas as idades!</p>
        </div>
      </div>

      <div className='flex-1 flex flex-col items-center justify-start md:justify-center pt-10 md:pt-0 px-6 bg-white text-black'>
        <div className='flex w-full max-w-lg'>
          <h2 className='font-bold text-md md:text-3xl text-black uppercase'>Faça seu login</h2>
        </div>
        <form onSubmit={formik.handleSubmit} className="mt-4 md:mt-8 flex flex-col w-full max-w-lg">
          {formik.status && <p className="text-red-500 text-sm text-center">{formik.status}</p>}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="username"
              className="text-sm text-gray-800"
            >
              Seu username
            </label>
            <input 
              type="text" 
              id="username"
              placeholder="Digite seu username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              className="border border-black py-3 px-6 rounded-full placeholder:text-gray-500 text-black focus:outline-zinc-900"
            />
            {formik.touched.username && formik.errors.username && <p className="text-red-500 text-sm">{formik.errors.username}</p> }
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label 
              htmlFor="password"
              className="text-sm text-gray-800"
            >
              Sua senha
            </label>

            <div className="relative flex w-full rounded-md shadow-sm">
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Digite sua senha"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className="block w-full border border-black py-3 px-6 rounded-full placeholder:text-gray-500 text-black focus:outline-zinc-900"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-6 outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 
                  <EyeSlash className="text-gray-500" weight="bold" size={20}/>
                  : 
                  <Eye className="text-gray-500" weight="bold" size={20}/>
                }
                
              </button>
            </div>
              {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm">{formik.errors.password}</p> }
          </div>

          <button 
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="bg-black rounded-full text-white px-5 py-3 md:px-6 md:py-4 mt-8 font-bold transition-colors hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {
            formik.isSubmitting ? 
              <CircleNotch 
                size={24}
                weight="bold" 
                className="animate-spin text-white mx-auto" 
              /> 
              : 'Entrar'
            } 
          </button>
        </form>
        <p className='mt-6'>
          Não tem conta? {' '}
          <Link href="/signup" className='text-gray-700 font-bold hover:text-black transition-colors'>
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = parseCookies(context);
  const token = cookies['ngcash.token']

  if(token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {},
  }
}