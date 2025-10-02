import React from 'react'

function StoreFeatures() {
  return (
    <div className='w-full py-9 sm:py-12 md:py-16 lg:py-20 bg-[#FAF4F4] text-center sm:text-left'>
        <div className='max-w-[1440px] mx-auto px-6 grid sm:grid-cols-3 gap-6 sm:gap-12 lg:gap-16'>
            <div>
                <h2 className='font-medium text-[24px] md:text-[28px]'>Free Delivery</h2>
                <p className='md:text-lg lg:text-xl text-[#9F9F9F]'>For all orders over $50, consectetur adipiscing elit.</p>
            </div>
            <div>
                <h2 className='font-medium text-[24px] md:text-[28px]'>90 Days Return</h2>
                <p className='md:text-lg lg:text-xl text-[#9F9F9F]'>If goods have problems, consectetur adipim scing elit.</p>
            </div>
            <div>
                <h2 className='font-medium text-[24px] md:text-[28px]'>Secure Payment</h2>
                <p className='md:text-lg lg:text-xl text-[#9F9F9F]'>100% secure payment, consectetur adipim scing elit.</p>
            </div>
        </div>
    </div>
  )
}

export default StoreFeatures