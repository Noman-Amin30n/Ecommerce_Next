import React, { useEffect } from 'react'

function useOutsideClick<T extends HTMLElement>(ref: (React.RefObject<T> | null), callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Ignore click if target is no longer in the document body (e.g. detached during state transition)
      if (!document.body.contains(target)) {
        return;
      }
      if (ref && ref.current && !ref.current.contains(target)) {
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