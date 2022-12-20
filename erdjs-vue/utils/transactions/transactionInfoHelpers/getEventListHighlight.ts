import type { EventType } from 'erdjs-vue/types/serverTransactions.types';

export const getEventListHighlight = (event: EventType, id?: string) => {
  const { hash } = window.location;
  const hashValues = hash.split('/');
  const formattedHash = hashValues[0] ? hashValues[0].replace('#', '') : '';
  const eventOrder = hashValues[1] ?? 0;

  const highlight = formattedHash === id && event.order === Number(eventOrder);

  return highlight;
};
