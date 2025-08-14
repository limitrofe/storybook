#!/bin/bash
# Script automático para aquecer cache do projeto dias-perfeitos
# Gerado automaticamente em: 8/13/2025, 10:40:40 PM

echo "🔥 Aquecendo cache do projeto: dias-perfeitos"
echo "📊 Total de arquivos: 1291"
echo "🌐 CDN Base: https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35"
echo ""

# Função para requisição de aquecimento
warm_url() {
  local url="$1"
  local response_code=$(curl -s -o /dev/null -w "%{http_code}" "https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35$url")
  
  if [ "$response_code" -eq 200 ]; then
    echo "✅ $url (HTTP $response_code)"
  else
    echo "❌ $url (HTTP $response_code)"
  fi
}

export -f warm_url

echo "🚀 Iniciando aquecimento em paralelo (8 conexões simultâneas)..."
echo ""

# Processar em paralelo
cat cache-list.txt | xargs -P 8 -I {} bash -c 'warm_url "{}"'

echo ""
echo "✅ Aquecimento do cache concluído!"
echo "🎯 Projeto: dias-perfeitos"
echo "🌐 URL: https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35/g1/dias-perfeitos"
