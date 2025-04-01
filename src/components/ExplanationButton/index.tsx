'use client'

import { Volume2Icon, VolumeXIcon } from 'lucide-react'
import React, { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ExplanationButton = () => {
  const [isExplanation, setIsExplanation] = useState(false)
  return (
    <Button onClick={() => setIsExplanation(!isExplanation)} className={cn('absolute top-4 right-4 rounded-[20px] bg-white text-black lg:text-base', isExplanation && 'bg-primary-yellow text-black')}>
      Mở thuyết minh {isExplanation ? <Volume2Icon /> : <VolumeXIcon />}
    </Button>
  )
}

export default memo(ExplanationButton)
