import { DEFAULT_HEADERS } from "config/constants";

/**
 * Manipula erros que ocorrem durante a execução do proxy.
 * 
 * @param error - O objeto de erro que foi gerado.
 * @returns Uma resposta HTTP com status 500 e uma mensagem de erro em formato JSON.
 */
export async function errorHandler(error: Error): Promise<Response> {
    // Loga o erro no console para fins de depuração
    console.error('Proxy Error:', error);
    
    // Retorna uma nova resposta com o erro formatado em JSON
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', // Mensagem de erro genérica
        message: error.message // Mensagem de erro específica
      }), {
        status: 500, // Código de status HTTP para erro interno do servidor
        headers: {
          'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
          ...DEFAULT_HEADERS // Inclui cabeçalhos padrão
        }
      }
    );
}