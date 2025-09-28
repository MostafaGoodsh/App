import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upload avatar function called');
    
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Authentication required')
    }

    console.log('User authenticated:', user.id);

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    console.log('File received:', file.name, file.type, file.size);

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`
    
    console.log('Uploading to path:', fileName);

    // Delete old avatar if exists
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(user.id, { limit: 100 })
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`)
      console.log('Deleting old files:', filesToDelete);
      
      await supabase.storage
        .from('avatars')
        .remove(filesToDelete)
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type 
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    console.log('Upload successful');

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    console.log('Public URL generated:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        fileName: fileName
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed'
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  }
})