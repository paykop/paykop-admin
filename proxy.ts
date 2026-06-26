import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/unauthorized(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes and unauthorized page through without checks
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // If not authenticated, redirect to sign-in page
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Extract the role from session claims (checking root claims, publicMetadata, and metadata)
  const role =
    (sessionClaims as any)?.role ||
    (sessionClaims as any)?.publicMetadata?.role ||
    (sessionClaims as any)?.metadata?.role;

  // Reject access and redirect to /unauthorized if the user is not an admin
  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
