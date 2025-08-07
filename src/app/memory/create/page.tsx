import { CreateMemoryClient } from './create-memory-client'

export default function CreateMemoryPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Memory</h1>
                    <p className="text-gray-600 mt-1">Add a new memory with details and tags</p>
                </div>
                
                <CreateMemoryClient />
            </div>
        </div>
    )
}