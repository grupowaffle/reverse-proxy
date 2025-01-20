/**
 * Tempo de vida padrão do cache em segundos.
 * Este valor define por quanto tempo os dados devem ser armazenados em cache.
 * O valor padrão é de 120 segundos (2 minutos).
 */
export const DEFAULT_CACHE_TTL = 120;

/**
 * Tempo de vida do cache para ativos em segundos.
 * Este valor define por quanto tempo os ativos (como imagens, scripts, etc.)
 * devem ser armazenados em cache. O valor padrão é de 86400 segundos (24 horas).
 */
export const ASSET_CACHE_TTL = 86400;

/**
 * Cabeçalhos padrão para as respostas HTTP.
 * Esses cabeçalhos são utilizados para controlar o acesso e as permissões
 * de métodos e cabeçalhos nas requisições.
 */
export const DEFAULT_HEADERS = {
  /**
   * Permite que qualquer origem acesse os recursos.
   * O valor '*' indica que todas as origens são permitidas.
   */
  'Access-Control-Allow-Origin': '*',

  /**
   * Define os métodos HTTP permitidos nas requisições.
   * Os métodos permitidos incluem: GET, POST, PUT, DELETE, OPTIONS e PATCH.
   */
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',

  /**
   * Define quais cabeçalhos podem ser utilizados nas requisições.
   * O valor '*' indica que todos os cabeçalhos são permitidos.
   */
  'Access-Control-Allow-Headers': '*',

  /**
   * Define o tempo máximo em segundos que os resultados de uma requisição
   * podem ser armazenados em cache. O valor padrão é de 120 segundos (2 minutos).
   */
  'Access-Control-Max-Age': '120',
}; 