export const extractApiError = (err) => {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.errors?.length) return err.response.data.errors.map(e => e.msg).join('. ');
  if (err.code === 'ERR_NETWORK') return 'Servidor indisponível. Verifique a ligação.';
  if (err.code === 'ECONNABORTED') return 'O servidor demorou muito a responder.';
  return 'Erro inesperado. Tente novamente.';
};
