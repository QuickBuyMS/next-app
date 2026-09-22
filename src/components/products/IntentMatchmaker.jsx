'use client';

import { useChat } from '@ai-sdk/react';

export default function IntentMatchmaker() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 my-8">
      <div className="space-y-6 mb-6 h-[500px] overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-inner">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-xl shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              
              {m.toolInvocations?.map(toolInvocation => {
                const toolCallId = toolInvocation.toolCallId;
                
                if (!('result' in toolInvocation)) {
                  return (
                    <div key={toolCallId} className="text-sm text-gray-400 italic mt-3 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                      Searching catalog for best matches...
                    </div>
                  );
                }

                if (toolInvocation.toolName === 'search_catalog') {
                  const results = toolInvocation.result;
                  if (results?.error) {
                     return <p key={toolCallId} className="text-sm text-red-500 italic p-3 bg-red-50 rounded-md w-full">Error searching catalog: {results.error}</p>
                  }
                  
                  // Wrap it in array if it somehow isn't (safety check)
                  const products = Array.isArray(results) ? results : (results.data || []);

                  return (
                    <div key={toolCallId} className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
                      {products.length > 0 ? (
                         products.map(product => (
                          <div key={product.product_id} className="border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors shadow-sm overflow-hidden flex flex-col justify-between h-full">
                            {product.image_url && (
                                <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover" />
                            )}
                            <div className="p-4 flex flex-col flex-1">
                                <h4 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{product.name}</h4>
                                <p className="text-green-600 font-bold text-lg mb-2">${Number(product.price).toFixed(2)}</p>
                                <p className="text-xs text-gray-600 line-clamp-3 mb-4">{product.description}</p>
                                <div className="mt-auto flex flex-wrap gap-1.5">
                                  {product.category_name && (
                                    <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-blue-100">{product.category_name}</span>
                                  )}
                                  {product.subcategory_name && (
                                    <span className="text-[10px] font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full uppercase tracking-wide border border-purple-100">{product.subcategory_name}</span>
                                  )}
                                </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic p-3 bg-gray-100 rounded-md w-full">No products found matching those criteria.</p>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length -1]?.role === 'user' && (
           <div className="flex items-center gap-2 text-gray-400 italic text-sm p-2">
               <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
               Assistant is thinking...
           </div>
        )}
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          try {
            handleSubmit(e);
          } catch(err) {
            console.error(err);
          }
        }} 
        className="flex gap-3 relative"
      >
        <input
          className="flex-1 p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base bg-white/50 backdrop-blur-sm"
          value={input}
          placeholder="E.g., I need a stainless steel pan that works on induction..."
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-semibold shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center min-w-[120px]"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}
