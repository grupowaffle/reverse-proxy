// Importa o tipo ProxyRoute do módulo de tipos
import { ProxyRoute } from './types/proxy';

// Define as rotas de proxy, que são utilizadas para redirecionar requisições
export const proxyRoutes: ProxyRoute[] = [
  {
    // Caminho da rota para marketing
    path: '/marketing',
    // URL de destino para onde as requisições serão redirecionadas
    target: 'https://dash.testeswaffle.org',
    // Controle de cache para a rota
    cacheControl: 'public, max-age=3600',
    // Cabeçalhos HTTP a serem enviados com a resposta
    headers: {
      // Impede que a página seja exibida em um iframe
      'X-Frame-Options': 'DENY',
      // Impede a detecção de tipo de conteúdo
      'X-Content-Type-Options': 'nosniff'
    }
  },
  {
    // Caminho da rota para referências
    path: '/referrals',
    // URL de destino para onde as requisições serão redirecionadas
    target: 'https://referrals.testeswaffle.org',
    // Reescritas de URL para manipulação de caminhos
    rewrites: [
      { 
        // Padrão de origem para reescrita
        source: '/referrals/api/(.*)',
        // Destino após a reescrita
        destination: '/api/$1'
      }
    ]
  },
  {
    // Caminho da rota para marcas
    path: '/marcas',
    // URL de destino para onde as requisições serão redirecionadas
    target: 'https://brands.testeswaffle.org'
  },
  {
    // Caminho da rota raiz
    path: '/',
    // URL de destino para a rota raiz
    target: 'https://waffle.com.br'
  }
]; 