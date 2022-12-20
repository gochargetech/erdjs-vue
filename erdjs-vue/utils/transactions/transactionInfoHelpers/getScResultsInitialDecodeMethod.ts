import { DecodeMethodEnum } from 'erdjs-vue/types';

export const getInitialScResultsDecodeMethod = () => {
  const { hash } = window.location;

  const initialDecodeMethod =
    hash.indexOf('/') > 0
      ? hash.substring(hash.indexOf('/') + 1)
      : DecodeMethodEnum.raw;

  const isInitialDecodedMethod =
    initialDecodeMethod &&
    Object.values<string>(DecodeMethodEnum).includes(initialDecodeMethod);

  return isInitialDecodedMethod ? initialDecodeMethod : DecodeMethodEnum.raw;
};
