import { sanitizeHeaders } from '../utils/security';
import { DEFAULT_HEADERS } from '../config/constants';
import { Env } from '../types/common';
import { ProxyRoute } from '../types/proxy';

/**
 * Interface para resposta do proxy com tipos específicos
 */
interface ProxyResponse {
  body: BodyInit | null;
  status: number;
  headers: HeadersInit;
}

/**
 * Classe responsável por gerenciar as requisições de proxy
 */
export class ProxyService {
  constructor(private readonly env: Env) {}

  /**
   * Modifica o conteúdo HTML para injetar configurações e ajustar URLs
   */
  private async modifyHtmlContent(
    response: Response, 
    proxyRoute: ProxyRoute, 
    originalUrl: URL
  ): Promise<Response> {
    // Adiciona base tag para garantir que os recursos sejam carregados corretamente
    const baseUrl = `${originalUrl.origin}${proxyRoute.path}`;
    const originalText = await response.text();
    const basePath = proxyRoute.path;
    
    // Script de configuração com tratamento melhorado de erros
    const configScript = `
      <script>
        // Configurações básicas
        window.BASE_PATH = '${basePath}';
        window.API_BASE = '${proxyRoute.target}';
        
        // Corrige o base path para o router do React
        window.__PROXY_BASE_PATH__ = '${basePath}';
        
        // Intercepta History API para manter o contexto do proxy
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;
        
        window.history.pushState = function(state, title, url) {
          if (url && !url.startsWith('http')) {
            // Adiciona o base path se não for uma URL absoluta
            if (!url.startsWith(window.__PROXY_BASE_PATH__)) {
              url = window.__PROXY_BASE_PATH__ + (url.startsWith('/') ? url : '/' + url);
            }
          }
          return originalPushState.call(this, state, title, url);
        };
        
        window.history.replaceState = function(state, title, url) {
          if (url && !url.startsWith('http')) {
            // Adiciona o base path se não for uma URL absoluta
            if (!url.startsWith(window.__PROXY_BASE_PATH__)) {
              url = window.__PROXY_BASE_PATH__ + (url.startsWith('/') ? url : '/' + url);
            }
          }
          return originalReplaceState.call(this, state, title, url);
        };
        
        // Adiciona meta base para recursos relativos
        const baseTag = document.createElement('base');
        baseTag.href = '${baseUrl}/';
        document.head.prepend(baseTag);
        
        // Tratamento melhorado de erros de carregamento de imagem
        window.addEventListener('error', function(e) {
          if (e.target instanceof HTMLImageElement) {
            const originalSrc = e.target.src;
            const basePath = '${basePath}';
            if (originalSrc.includes(window.location.origin + basePath)) {
              e.target.src = originalSrc.replace(
                window.location.origin + basePath,
                '${proxyRoute.target}'
              );
            }
          }
        }, true);

        // Intercepta navegação para manter contexto do proxy
        window.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (link && link.href && link.href.startsWith(window.location.origin)) {
            const path = link.href.replace(window.location.origin, '');
            if (!path.startsWith(basePath)) {
              e.preventDefault();
              window.location.href = basePath + path;
            }
          }
        });
      </script>
    `;

    // Modifica URLs no HTML mantendo queries e fragments
    const modifiedText = originalText
      .replace(/<head>/i, `<head>${configScript}`)
      .replace(
        new RegExp(`((?:src|href)=["'])(/?[^"']*)(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
          if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
            return match;
          }
          const cleanUrl = url.replace(/^\/+/, '');
          return `${prefix}${originalUrl.origin}${proxyRoute.path}/${cleanUrl}${suffix}`;
        }
      )
      .replace(
        new RegExp(proxyRoute.target, 'g'),
        originalUrl.origin + proxyRoute.path
      );

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
   * Aplica regras de rewrite à URL
   */
  private applyRewrites(url: URL, proxyRoute: ProxyRoute): URL {
    const targetUrl = new URL(proxyRoute.target);
    
    if (proxyRoute.rewrites) {
      const pathname = url.pathname;
      for (const rewrite of proxyRoute.rewrites) {
        const regex = new RegExp(rewrite.source);
        if (regex.test(pathname)) {
          // Preserva query parameters ao fazer rewrite
          const newPathname = pathname.replace(regex, rewrite.destination);
          targetUrl.pathname = newPathname;
          targetUrl.search = url.search; // Mantém query parameters
          return targetUrl;
        }
      }
    }
    
    // Se não houver rewrite, mantém o caminho original removendo o prefixo da rota
    const relativePath = url.pathname.replace(proxyRoute.path, '');
    targetUrl.pathname = relativePath || '/';
    targetUrl.search = url.search;
    return targetUrl;
  }

  /**
   * Verifica se o caminho é um arquivo estático
   */
  private isAsset(pathname: string): boolean {
    return /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|pdf|woff|woff2|ttf|eot)$/i.test(pathname);
  }

  /**
   * Processa a resposta baseado no tipo de conteúdo
   */
  private async processResponse(
    response: Response,
    proxyRoute: ProxyRoute,
    originalUrl: URL
  ): Promise<Response> {
    const contentType = response.headers.get('content-type') || '';

    // Para conteúdo HTML
    if (contentType.includes('text/html')) {
      return this.modifyHtmlContent(response, proxyRoute, originalUrl);
    }

    // Para assets estáticos
    if (this.isAsset(originalUrl.pathname)) {
      const headers = new Headers(response.headers);
      Object.entries(DEFAULT_HEADERS).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      if (proxyRoute.cacheControl) {
        headers.set('Cache-Control', proxyRoute.cacheControl);
      }

      // Assegura tipo correto para JavaScript
      if (originalUrl.pathname.endsWith('.js')) {
        headers.set('Content-Type', 'application/javascript');
      }

      return new Response(response.body, {
        status: response.status,
        headers
      });
    }

    // Para outros tipos de conteúdo
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        ...DEFAULT_HEADERS,
        ...proxyRoute.headers
      }
    });
  }

  /**
   * Manipula a requisição de proxy
   */
  async handleRequest(request: Request, proxyRoute: ProxyRoute): Promise<Response> {
    try {
      const originalUrl = new URL(request.url);
      const targetUrl = this.applyRewrites(originalUrl, proxyRoute);

      console.log(`Proxy request: ${originalUrl.pathname} -> ${targetUrl.toString()}`);

      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: sanitizeHeaders(request.headers),
        body: request.body,
        redirect: 'follow',
      });

      const response = await fetch(proxyRequest);
      return this.processResponse(response, proxyRoute, originalUrl);
    } catch (error) {
      console.error('Proxy error:', error);
      throw error;
    }
  }
}