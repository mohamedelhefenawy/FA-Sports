'use client'
import { ArrowRight } from '@phosphor-icons/react'
import { useRouter } from "next/navigation";
import React from 'react'
import { motion } from 'framer-motion'

// import {ArrowRight} from '@phosphor-icons/react'
export default function Span() {
    const router  = useRouter()
  return (
    <div className='mt-56 w-[80%] mx-auto overflow-hidden'>
      <motion.div 
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
      className='bg-white p-6  rounded-3xl flex flex-col justify-between h-[40vh] '
      >
        <h1 className='text-5xl font-bold break-words'>Body Measurements</h1>
        <div className='flex justify-end bg-orange-500 p-6 rounded-full w-20 cursor-pointer hover:w-full transition-all duration-1000 ease-linear' onClick={()=>router.push('/video')}>
            <ArrowRight size={32}  className='text-white'/>
        </div>

      </motion.div>
    </div>
  )
}
