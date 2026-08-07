// Configuration and helper functions for Supabase integration

// Valores predeterminados configurados para Supabase
const DEFAULT_SUPABASE_URL = "https://vlrnbgvmcwizcvlurijw.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscm5iZ3ZtY3dpemN2bHVyaWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzU5NDYsImV4cCI6MjEwMTcxMTk0Nn0.Jfqy2zcBWBxvyC6XN3ysJPdea1lxoKJgTb2pLoKvfvo";

function normalizarUrlSupabase(rawUrl) {
  if (!rawUrl) return "";
  let clean = rawUrl.trim();
  clean = clean.replace(/\/rest\/v1\/?$/, "");
  return clean.replace(/\/$/, "");
}

function getSupabaseConfig() {
  const url = normalizarUrlSupabase(localStorage.getItem("sproveedores_supabase_url") || DEFAULT_SUPABASE_URL);
  const key = (localStorage.getItem("sproveedores_supabase_key") || DEFAULT_SUPABASE_ANON_KEY).trim();
  return { url, key };
}

let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const { url, key } = getSupabaseConfig();
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (url && key) {
      supabaseClient = window.supabase.createClient(url, key);
      return supabaseClient;
    }
  }
  return null;
}

// Inicialización diferida del cliente si cambia la configuración
function reiniciarClienteSupabase(url, key) {
  if (url) localStorage.setItem("sproveedores_supabase_url", url.trim());
  if (key) localStorage.setItem("sproveedores_supabase_key", key.trim());
  
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    const currentConfig = getSupabaseConfig();
    supabaseClient = window.supabase.createClient(currentConfig.url, currentConfig.key);
  }
  return supabaseClient;
}

// Funciones CRUD
async function obtenerProductosSupabase() {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn("[Supabase] Error al consultar la tabla productos:", error.message || error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("[Supabase] Error de conexión:", err.message || err);
    return null;
  }
}

async function guardarProductoSupabase(producto) {
  const sb = getSupabase();
  if (!sb) throw new Error("Cliente de Supabase no configurado. Configura la URL y la Anon Key en los ajustes.");

  const payload = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio || 'Consultar',
    detalle_precio: producto.detalle_precio || producto.detalle || '',
    categoria: producto.categoria || 'alimentos',
    imagen_url: producto.imagen_url || ''
  };

  const { data, error } = await sb
    .from('productos')
    .insert([payload])
    .select();

  if (error) throw error;
  return data;
}

async function actualizarProductoSupabase(id, producto) {
  const sb = getSupabase();
  if (!sb) throw new Error("Cliente de Supabase no configurado.");

  const payload = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio || 'Consultar',
    detalle_precio: producto.detalle_precio || producto.detalle || '',
    categoria: producto.categoria || 'alimentos',
    imagen_url: producto.imagen_url || ''
  };

  const { data, error } = await sb
    .from('productos')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

async function eliminarProductoSupabase(id) {
  const sb = getSupabase();
  if (!sb) throw new Error("Cliente de Supabase no configurado.");

  const { error } = await sb
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
