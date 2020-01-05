import logger from './logger';

/**
 * This is a stateful object that stores information about a uri
 * for a domain. The goal is to store all details about a uri, like
 * method, request fields, query params etc that can be found.
 *
 * @return {{mergePathDetails: mergePathDetails}}
 */
const pathDetails = () => {
  let url = '';
  const methods = new Set();
  let formInputs = [];
  const paramsMap = new Map();

  const mergeQueryParams = (urlToMerge) => {
    if (url === '') url = `${urlToMerge.protocol}//${urlToMerge.host}${urlToMerge.pathname}`;
    methods.add('GET');
    logger.info(`[pathDetails][mergeQueryParams] merging the search parameters for ${urlToMerge.href} into root ${url}`);
    urlToMerge.searchParams.forEach((value, name) => {
      if (!paramsMap.has(name)) {
        paramsMap.set(name, new Set());
      }
      paramsMap.get(name).add(value);
    });
  };

  const mergePathDetails = (urlToMerge) => {
    mergeQueryParams(urlToMerge);
  };

  const mergeFormDetails = (formToMerge) => {
    methods.add(formToMerge.method);
    formInputs = formInputs.concat(formToMerge.inputs);
  };

  const getDetails = () => ({
    url,
    methods,
    formInputs,
    paramsMap,
  });

  return {
    mergePathDetails,
    mergeFormDetails,
    getDetails,
  };
};

export default pathDetails;
