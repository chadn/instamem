import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { fetchMemoryById } from '@/lib/memory-queries'
import { EditMemoryClient } from './edit-memory-client'

interface EditMemoryPageProps {
    params: Promise<{ id: string }>
}

export default async function EditMemoryPage({ params }: EditMemoryPageProps) {
    const supabase = await createClient()
    const { id } = await params
    
    // Fetch memory data server-side
    const memory = await fetchMemoryById(supabase, id)
    
    if (!memory) {
        notFound()
    }
    
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <EditMemoryClient memory={memory} />
            </div>
        </div>
    )
}