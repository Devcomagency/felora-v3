"use client"
export default function FormFooter({ canBack, canNext, onBack, onNext, submitLabel = 'Continuer' }:{ canBack?:boolean; canNext?:boolean; onBack?:()=>void; onNext?:()=>void; submitLabel?:string }){
  return (
    <div className="mt-6 flex items-center justify-between">
      <button disabled={!canBack} onClick={onBack} className={`px-4 py-2 rounded-lg border ${canBack ? 'border-white/20 text-white hover:bg-white/10' : 'border-white/10 text-white/40 cursor-not-allowed'}`}>Retour</button>
      <button disabled={!canNext} onClick={onNext} className={`px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/80 to-purple-600/80 text-white font-medium ${canNext ? 'hover:from-pink-500 hover:to-purple-600' : 'opacity-60 cursor-not-allowed'}`}>{submitLabel}</button>
    </div>
  )
}
