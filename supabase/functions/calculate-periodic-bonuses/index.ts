import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { data: entregadores, error: err1 } = await supabase
      .from('entregadores')
      .select('id, nome')
      .eq('ativo', true)

    if (err1) throw err1

    for (const entregador of entregadores) {
      const { data: entregas, error: err2 } = await supabase
        .from('entregas')
        .select('id')
        .eq('entregador_id', entregador.id)
        .gte('data_entrega', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'aprovada')

      if (err2) throw err2

      const quantidadeEntregas = entregas?.length ?? 0
      const bonus = quantidadeEntregas * 5

      const { error: err3 } = await supabase
        .from('bonuses')
        .insert({
          entregador_id: entregador.id,
          valor: bonus,
          data_bonus: new Date().toISOString(),
          descricao: `Bônus semanal: ${quantidadeEntregas} entregas aprovadas`
        })

      if (err3) throw err3
    }

    return new Response(
      JSON.stringify({ message: 'Bônus periódicos calculados e aplicados.' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

