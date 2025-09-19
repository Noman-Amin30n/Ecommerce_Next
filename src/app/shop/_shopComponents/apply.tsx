"use client"
import React from 'react'
import { cn } from '@/lib/utils'
import { useFilterContext } from '@/contexts/filterContext'
import { setIsAPPlyingFilterCookie, setItemsPerPageCookie, setMaxPriceFilterCookie, setPageCookie, setSortByCookie } from '@/actions/filter.action';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

function ApplyFilter({className}: {className?: string}) {
    const router = useRouter();
    const { itemsPerPage, priceRangeValue, sortByCurrValue, isApplyingFilter, setIsApplyingFilter } = useFilterContext();
    const handleCookies = async () => {
        setIsApplyingFilter(true);
        await setIsAPPlyingFilterCookie(true);
        await setMaxPriceFilterCookie(priceRangeValue);
        await setItemsPerPageCookie(itemsPerPage);
        await setSortByCookie(sortByCurrValue);
        await setPageCookie(1);
        setIsApplyingFilter(false);
        router.refresh();
    }
  return (
    <button className={cn(`bg-black text-white py-2 px-4 cursor-pointer rounded-sm ${className}`)} onClick={handleCookies} disabled={isApplyingFilter}>
        {isApplyingFilter ? <Loader className="animate-spin" /> : "Apply"}
    </button>
  )
}

export default ApplyFilter