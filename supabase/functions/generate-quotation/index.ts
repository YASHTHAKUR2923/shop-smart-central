import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { inquiry_id } = await req.json()

    if (!inquiry_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Inquiry ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Fetch the inquiry with product details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('*, product:products(*)')
      .eq('id', inquiry_id)
      .single()

    if (inquiryError || !inquiry) {
      console.error('Error fetching inquiry:', inquiryError)
      return new Response(
        JSON.stringify({ success: false, error: 'Inquiry not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Build quotation items
    const items = []
    let totalAmount = 0

    if (inquiry.product) {
      const unitPrice = inquiry.product.price || 0
      const quantity = 1
      const total = unitPrice * quantity
      totalAmount = total

      items.push({
        product_id: inquiry.product.id,
        product_name: inquiry.product.name,
        quantity,
        unit_price: unitPrice,
        total,
      })
    }

    // Create the quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        inquiry_id: inquiry.id,
        customer_email: inquiry.customer_email,
        items: items,
        total_amount: totalAmount,
        notes: `Quotation generated for inquiry from ${inquiry.customer_name}`,
      })
      .select()
      .single()

    if (quotationError) {
      console.error('Error creating quotation:', quotationError)
      return new Response(
        JSON.stringify({ success: false, error: quotationError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update inquiry status to 'quoted'
    await supabase
      .from('inquiries')
      .update({ status: 'quoted' })
      .eq('id', inquiry_id)

    console.log('Quotation generated successfully:', quotation.id)
    
    return new Response(
      JSON.stringify({ success: true, quotation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})