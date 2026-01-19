import React from 'react'

interface pageProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

const PageHeader = ({title, subtitle, children}: pageProps) => {
  return (
    <div className='flex items-center justify-between mb-6'>
        <div className=''>
            <h1 className='text-2xl font-medium mb-2 tracking-tight text-slate-900'>
                {title}
            </h1>
            {subtitle && (
                <p className='text-slate-500 text-sm'>
                    {subtitle}
                </p>
            )}
        </div>
        {children && <div>{children}</div>}
    </div>
  )
}

export default PageHeader