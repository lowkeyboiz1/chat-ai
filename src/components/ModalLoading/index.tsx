'use client'

import { useAtom } from 'jotai'
import { isOpenModalLoading } from '@/atoms/modal'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCallback, memo } from 'react'
import { motion } from 'framer-motion'

const ModalLoading = () => {
  const [isOpen, setIsOpen] = useAtom(isOpenModalLoading)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
    },
    [setIsOpen]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent hideCloseButton className='flex h-40 w-40 items-center justify-center rounded-[20px] border-0 bg-transparent p-0 shadow-lg shadow-none'>
        <div className='flex h-full w-full items-center justify-center'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='flex items-center space-x-3'>
              <motion.div className='bg-primary-blue h-3 w-3 rounded-full' animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0 }}></motion.div>
              <motion.div
                className='bg-primary-blue h-3 w-3 rounded-full'
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }}
              ></motion.div>
              <motion.div
                className='bg-primary-blue h-3 w-3 rounded-full'
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.4 }}
              ></motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(ModalLoading)
