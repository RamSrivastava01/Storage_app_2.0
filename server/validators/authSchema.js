import {z} from 'zod'

export const loginSchema = z.object({
   
   email : z.email("Enter a valid email"),
   password : z.string()

}) 

export const registerSchema = z.object({
   name : z.string().min(3, "names length should be greater than 3").max(100, "Names length should be less than 100"),
   email : z.email("Enter a valid email"),
   password : z.string(),
   otp : z.string().regex(' /^\d{4}$/', "Enter a valid OTP")

}) 
export const otpSchema = z.object({
   email : z.email("Email is required"),
   otp : z.string().regex(' /^\d{4}$/', "Enter a valid OTP")
})

