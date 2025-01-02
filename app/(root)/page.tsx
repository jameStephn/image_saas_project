import { Collection } from '@/components/shared/Collections'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { navLinks } from '@/constants'
import { getAllImages } from '@/lib/actions/image.actions'
import { Dialog, DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
const Home = async ({ searchParams,params }: SearchParamProps) => {
  const awaitedSearchParams = await searchParams; // Await searchParams as it is a Promise

  const page = Number(awaitedSearchParams?.page) || 1;
  const searchQuery = (awaitedSearchParams?.query as string)||'';
  const images = await getAllImages({page,searchQuery})
  return (
   <>
   <VisuallyHidden>
    <Dialog>

    <DialogTitle>Home</DialogTitle>
    </Dialog>
    </VisuallyHidden>
   
   <section className='home'>
<h1 className='home-heading'>
  make your own creativity for your business and social media
</h1>
<ul className='flex-center w-full gap-20'>
  {navLinks.slice(1,5).map((link)=>(
    <Link href={link.route} key={link.route} className='flex-center flex-col gap-2'>
      <li className='flex-center w-fit rounded-full bg-white p-4'><Image
      src={link.icon}
      alt='image'
      width={24}
      height={24}
      /></li>
      <p className='p-14-medium text-center text-white'>{link.label}</p>
    </Link>
  ))}
</ul>
   </section>
   <section className='sm:mt-12'>
    <Collection  
    hasSearch={true}
    images={images?.data}
    totalPages={images?.totalPage}
    page={page}

    />
   </section>
   </>
  )
}

export default Home