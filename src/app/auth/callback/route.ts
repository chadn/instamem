import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Validate code format (should be a UUID-like string)
    if (!/^[a-f0-9-]{36,}$/i.test(code)) {
      return NextResponse.redirect(`${origin}/login?error=invalid_code`)
    }

    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      }

      // Check if this is a first-time user and create welcome memory
      // Small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log(`Auth callback: User ${user.id} authenticated`)
        
        // Check if user already has any memories
        const { data: existingMemories, error: selectError } = await supabase
          .from('memories')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (selectError) {
          console.error('Error checking existing memories:', selectError)
        } else {
          console.log(`Found ${existingMemories?.length || 0} existing memories for user ${user.id}`)
        }

        // If no memories exist, create welcome memory
        if (!existingMemories || existingMemories.length === 0) {
          console.log(`Creating welcome memory for user ${user.id}`)
          
          const { error: insertError } = await supabase.from('memories').insert({
            user_id: user.id,
            content: 'First time using Instamem',
            memory_date: new Date().toISOString(),
            url: 'https://instamem.chadnorwood.com'
          })
          
          if (insertError) {
            console.error('Error creating welcome memory:', insertError)
          } else {
            console.log(`Welcome memory created successfully for user ${user.id}`)
          }
        }
      } else {
        console.log('Auth callback: No user found after authentication')
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  return NextResponse.redirect(`${origin}/`)
}