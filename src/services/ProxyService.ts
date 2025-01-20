import { sanitizeHeaders } from '../utils/security';
import { DEFAULT_HEADERS } from '../config/constants';
import { Env } from 'types/common';
import { ProxyRoute } from 'types/proxy';

/**
 * Classe responsável por gerenciar as requisições de proxy.
 */
export class ProxyService {
  /**
   * Construtor da classe ProxyService.
   * @param env - Variáveis de ambiente necessárias para o funcionamento do serviço.
   */
  constructor(private readonly env: Env) {}

  /**
   * Modifica o conteúdo HTML da resposta para incluir scripts de configuração.
   * @param response - A resposta original que será modificada.
   * @param proxyRoute - A rota de proxy que contém informações sobre o redirecionamento.
   * @param url - A URL original da requisição.
   * @returns Uma nova resposta com o conteúdo HTML modificado.
   */
  async modifyHtmlContent(response: Response, proxyRoute: ProxyRoute, url: URL): Promise<Response> {
    const originalText = await response.text();
    const basePath = proxyRoute.path;
    
    // Script de configuração que será inserido no HTML
    const configScript = `
      <script>
        window.BASE_PATH = '${basePath}';
        window.API_BASE = '${proxyRoute.target}';
        
        window.addEventListener('error', function(e) {
          if (e.target.tagName === 'IMG') {
            const originalSrc = e.target.src;
            if (originalSrc.includes(window.location.origin + basePath)) {
              const newSrc = originalSrc.replace(window.location.origin + basePath, window.location.origin);
              e.target.src = newSrc;
            }
          }
        }, true);
      </script>
    `;

    // Modifica o texto original do HTML
    const modifiedText = originalText
      .replace(/<script/i, `${configScript}<script`)
      .replace(new RegExp(proxyRoute.target, 'g'), url.origin + proxyRoute.path)
      .replace(
        /(?<=(?:src|href)=["'])\/?(?!http|\/\/|data:)(.*?)(?=["'])/g,
        (match) => {
          const cleanMatch = match.replace(/^\/+/, '');
          return `${url.origin}${proxyRoute.path}/${cleanMatch}`;
        }
      );

    // Retorna a nova resposta com o conteúdo modificado
    return new Response(modifiedText, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html',
        ...DEFAULT_HEADERS,
        ...proxyRoute.headers
      }
    });
  }

  /**
   * Manipula a requisição recebida e retorna a resposta apropriada.
   * @param request - A requisição original que está sendo manipulada.
   * @param proxyRoute - A rota de proxy que contém informações sobre o redirecionamento.
   * @returns A resposta da requisição processada.
   */
  async handleRequest(request: Request, proxyRoute: ProxyRoute): Promise<Response> {
    const url = new URL(request.url);
    const targetUrl = new URL(proxyRoute.target);

    // Aplica reescritas de URL se configuradas
    if (proxyRoute.rewrites) {
      for (const rewrite of proxyRoute.rewrites) {
        const regex = new RegExp(rewrite.source);
        if (regex.test(url.pathname)) {
          targetUrl.pathname = url.pathname.replace(regex, rewrite.destination);
          break;
        }
      }
    }

    // Cria a requisição de proxy
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: sanitizeHeaders(request.headers),
      body: request.body,
      redirect: 'follow',
    });

    try {
      const response = await fetch(proxyRequest);
      const contentType = response.headers.get('content-type') || '';

      // Manipula diferentes tipos de conteúdo
      if (contentType.includes('text/html')) {
        return this.modifyHtmlContent(response, proxyRoute, url);
      }

      // Manipula ativos com cache
      if (this.isAsset(url.pathname)) {
        return new Response(response.body, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers),
            ...DEFAULT_HEADERS,
            'Cache-Control': proxyRoute.cacheControl || 'public, max-age=31536000'
          }
        });
      }

      // Resposta padrão
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          ...DEFAULT_HEADERS,
          ...proxyRoute.headers
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica se o caminho corresponde a um ativo (ex: js, css, imagens).
   * @param pathname - O caminho da URL a ser verificado.
   * @returns Verdadeiro se o caminho for um ativo, falso caso contrário.
   */
  private isAsset(pathname: string): boolean {
    return Boolean(
      pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|pdf|woff|woff2|ttf|eot)$/i)
    );
  }
}