#!/bin/bash
# Script para aquecer o cache com TODOS os frames
# Executa em paralelo para ser mais rápido

echo "🔥 Aquecendo cache com 1795 arquivos..."

# Função para fazer o curl
warm_url() {
  url=$1
  curl -s -o /dev/null -w "%{http_code}" "https://s3.glbimg.com/v1/AUTH_e03f7a1106bb438e970511f892f07c35$url"
  echo "✓ $url"
}

export -f warm_url

# Processar em paralelo (10 de cada vez)
cat cache-all-frames.txt | xargs -P 10 -I {} bash -c 'warm_url "{}"'

echo "✅ Cache aquecido com sucesso!"
