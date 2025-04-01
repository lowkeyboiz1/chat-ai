'use client'

import { isOpenModalLocationAndNotification } from '@/atoms/modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAtom } from 'jotai'
import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'

const ModalLocationAndNotification = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useAtom(isOpenModalLocationAndNotification)
  const [permissionStatus, setPermissionStatus] = useState({
    location: false,
    notification: false
  })

  useEffect(() => {
    // Check if both permissions are granted, redirect to login page
    if (permissionStatus.location && permissionStatus.notification) {
      setIsOpen(false)
      router.push('/login')
    }
  }, [permissionStatus, setIsOpen, router])

  const handleRequestPermissions = useCallback(async () => {
    try {
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermissionStatus((prev) => ({ ...prev, location: true }))
          },
          (error) => {
            console.error('Location permission denied:', error)
          }
        )
      }

      // Request notification permission
      if ('Notification' in window) {
        const result = await Notification.requestPermission()
        if (result === 'granted') {
          setPermissionStatus((prev) => ({ ...prev, notification: true }))
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error)
    }
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
    },
    [setIsOpen]
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className='rounded-[40px] p-12'>
          <DialogHeader>
            <DialogTitle className='text-3xl font-bold text-[#333333]'>Để Vinimex AI hỗ trợ tốt hơn</DialogTitle>
            <div className='flex flex-col gap-12'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-start gap-1 text-lg text-[#333333]'>
                  <span>
                    <CircleCheck className='fill-primary-green text-white' />
                  </span>{' '}
                  <span>
                    <strong>Bật Định vị:</strong> Dự báo thời tiết & giá nông sản chính xác.
                  </span>
                </div>
                <div className='flex items-start gap-1 text-lg text-[#333333]'>
                  <span>
                    <CircleCheck className='fill-primary-green text-white' />
                  </span>{' '}
                  <span>
                    <strong>Bật Thông báo:</strong> Nhận cảnh báo sâu bệnh và giá tăng cao.
                  </span>
                </div>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Button className='w-full rounded-full' onClick={handleRequestPermissions}>
                  Bật định vị & thông báo
                </Button>
                <p className='text-center text-lg text-[#A4A4A4]'>Thông tin của bạn được bảo mật theo chính sách của Vinimex AI.</p>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default memo(ModalLocationAndNotification)
