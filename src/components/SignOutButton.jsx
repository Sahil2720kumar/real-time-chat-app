'use client'

import { Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import Button from './ui/Button'


const SignOutButton = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState(false)
  return (
    <Button
      {...props}
      variant='ghost'
      onClick={async () => {
        setIsSigningOut(true)
        try {
          await signOut({callbackUrl:"/login",redirect:true})
        } catch (error) {
          toast.error('There was a problem signing out')
        } finally {
          setIsSigningOut(false)
        }
      }}>
      {isSigningOut ? (
        <Loader2 className='animate-spin h-4 w-4' />
      ) : (
        <LogOut className='w-4 h-4' />
      )}
    </Button>
  )
}

export default SignOutButton
