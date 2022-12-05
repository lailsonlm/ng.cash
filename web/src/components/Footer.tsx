import { GithubLogo, LinkedinLogo } from "phosphor-react";

export function Footer() {

  return (
    <div className='flex flex-col w-full h-56 items-center justify-center px-6 md:px-10 bg-black gap-4'>
      <div className="flex gap-2">
        <a 
          href="https://github.com/lailsonlm" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:-translate-y-2 transition-transform"
        >
          <GithubLogo className="text-white" weight="bold" size={32} />
        </a>

        <a 
          href="https://www.linkedin.com/in/lailsonsobral/" 
          target="_blank" 
          rel="noreferrer" 
          className="hover:-translate-y-2 transition-transform"
        >
          <LinkedinLogo className="text-white" weight="bold" size={32} />
        </a>
      </div>
      
      <div className="flex">
        <p className='text-white'>Desenvolvido por{' '} 
          <a 
            href="https://portfolio-lailsonlm.vercel.app/" 
            target="_blank" 
            rel="noreferrer"
            className="text-white font-bold"
          >
            Lailson Sobral
          </a>
        </p>
        
      </div>
    </div>
  )
}