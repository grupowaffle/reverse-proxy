// Importa o tipo Env que define as variáveis de ambiente necessárias para o funcionamento do serviço.
import { Env } from './types';
// Importa as rotas de proxy configuradas.
import { proxyRoutes } from './proxyConfig';
// Importa a classe ProxyService que gerencia as requisições de proxy.
import { ProxyService } from './services/ProxyService';
// Importa o manipulador de erros para tratar exceções de forma adequada.
import { errorHandler } from './middleware/error';
// Importa os cabeçalhos padrão a serem utilizados nas respostas.
import { DEFAULT_HEADERS } from './config/constants';

// Exporta a configuração do serviço que lida com as requisições.
export default {
  // Método assíncrono que processa as requisições recebidas.
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Trata a requisição de pré-verificação CORS.
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: DEFAULT_HEADERS });
    }

    try {
      // Cria uma nova URL a partir da requisição recebida.
      const url = new URL(request.url);
      // Instancia o serviço de proxy com as variáveis de ambiente.
      const proxyService = new ProxyService(env);

      // Busca a rota de proxy correspondente à URL da requisição.
      const proxyRoute = proxyRoutes
        // Ordena as rotas pelo comprimento do caminho em ordem decrescente.
        .sort((a, b) => b.path.length - a.path.length)
        // Encontra a rota que corresponde ao início do caminho da URL.
        .find(route => url.pathname.startsWith(route.path));

      // Se nenhuma rota correspondente for encontrada, retorna um erro 404.
      if (!proxyRoute) {
        return new Response('Not Found', { 
          status: 404,
          headers: DEFAULT_HEADERS
        });
      }

      // Processa a requisição de proxy e retorna a resposta.
      return await proxyService.handleRequest(request, proxyRoute);
    } catch (error) {
      // Trata erros que possam ocorrer durante o processamento da requisição.
      return errorHandler(error as Error);
    }
  }
};