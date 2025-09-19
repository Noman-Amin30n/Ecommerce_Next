import React, { useEffect } from 'react'

function useOutsideClick<T extends HTMLElement>(ref: (React.RefObject<T> | null), callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref &&ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [ref, callback])
}

export default useOutsideClick