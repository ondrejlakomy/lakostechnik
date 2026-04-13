import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/prihlaseni",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/prepravy/:path*",
    "/pohyby/:path*",
    "/lokace/:path*",
    "/sklady/:path*",
    "/odberatele/:path*",
    "/elektrarny/:path*",
    "/stepkovace/:path*",
    "/ridici/:path*",
    "/uzivatele/:path*",
    "/turnusy/:path*",
    "/exporty/:path*",
    "/nastaveni/:path*",
    "/ridic/:path*",
    "/api/lokace/:path*",
    "/api/sklady/:path*",
    "/api/odberatele/:path*",
    "/api/elektrarny/:path*",
    "/api/stepkovace/:path*",
    "/api/ridici/:path*",
    "/api/uzivatele/:path*",
    "/api/turnusy/:path*",
    "/api/prepravy/:path*",
    "/api/pohyby/:path*",
    "/api/dashboard/:path*",
    "/api/exporty/:path*",
  ],
};
