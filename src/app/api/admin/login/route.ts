import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const {password} = await req.json()
  if(password === process.env.ADMIN_PASSWORD){
    const res = NextResponse.json({ok:true})
    res.cookies.set('ks_admin_auth', 'authenticated', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60*60*24*7,
      path: '/'
    })
    return res
  }
  return NextResponse.json({error:'Gabim'}, {status:401})
}

export async function DELETE(){
  const res = NextResponse.json({ok:true})
  res.cookies.delete('ks_admin_auth')
  return res
}