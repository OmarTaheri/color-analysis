import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata = {
 metadataBase:new URL('https://film.omartaheri.com'),
 title:'The Wolf of Wall Street | Omar Taheri',
 description:'A student colour analysis of Jordan Belfort’s story in The Wolf of Wall Street.',
 alternates:{canonical:'/'},
 icons:{icon:'/favicon.svg'},
 openGraph:{title:'The Wolf of Wall Street | Omar Taheri',description:'Colour, character and context in The Wolf of Wall Street.',url:'https://film.omartaheri.com',type:'website'}
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
