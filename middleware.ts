import {  clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
const isPublicRoute = createRouteMatcher(['/sign-in','/sign-up','/api/webhooks/clerk']);
export default clerkMiddleware(async (auth,request)=>{
  if(!isPublicRoute(request)){
    await auth.protect();
  }
  console.log("Request Headers:", request.headers);
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};