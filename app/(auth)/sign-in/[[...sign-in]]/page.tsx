import { SignIn } from '@clerk/nextjs'
import React from 'react'

const SignInPage = () => {
  return <SignIn routing='hash'/>
}

export default SignInPage