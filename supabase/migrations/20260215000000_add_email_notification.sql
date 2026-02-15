-- Enable pg_net extension to send http requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create function to send inquiry email notification via Edge Function
CREATE OR REPLACE FUNCTION public.send_inquiry_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_data RECORD;
  inquiry_payload JSONB;
BEGIN
  -- Get product information if inquiry has a product_id
  IF NEW.product_id IS NOT NULL THEN
    SELECT id, name, category INTO product_data
    FROM public.products
    WHERE id = NEW.product_id
    LIMIT 1;
  END IF;

  -- Build the payload
  inquiry_payload := jsonb_build_object(
    'id', NEW.id,
    'customer_name', NEW.customer_name,
    'customer_email', NEW.customer_email,
    'customer_phone', NEW.customer_phone,
    'product_id', NEW.product_id,
    'message', NEW.message,
    'status', NEW.status,
    'created_at', NEW.created_at,
    'product', CASE WHEN product_data IS NOT NULL THEN
      jsonb_build_object(
        'id', product_data.id,
        'name', product_data.name,
        'category', product_data.category
      )
    ELSE NULL END
  );

  -- Call the edge function (no auth needed - verify_jwt = false)
  BEGIN
    PERFORM
      net.http_post(
        url := 'https://eqhixgkcutopfbtbitfg.supabase.co/functions/v1/send-inquiry-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := inquiry_payload
      );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send inquiry notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS inquiry_notification_trigger ON public.inquiries;

-- Create trigger on INSERT
CREATE TRIGGER inquiry_notification_trigger
AFTER INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.send_inquiry_notification();

-- Comment
COMMENT ON FUNCTION public.send_inquiry_notification() IS
  'Automatically sends new inquiry email notifications via Edge Function';
