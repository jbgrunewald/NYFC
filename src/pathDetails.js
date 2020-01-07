import logger from './logger';

/**
 * This is a stateful object that stores information about a uri
 * for a domain. The goal is to store all details about a uri, like
 * method, request fields, query params etc that can be found.
 *
 * @return {{mergePathDetails: mergePathDetails}}
 */
const pathDetails = (urlWithoutParams) => {
  const url = urlWithoutParams;
  const methods = new Set();
  methods.add('GET');
  let formInputs = [];
  const paramsMap = new Map();
  let visited = false;

  const mergeQueryParams = (urlToMerge) => {
    logger.debug(`[pathDetails][mergeQueryParams] merging the search parameters for ${urlToMerge.href} into root ${url}`);
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
    visited,
  };
};

export default pathDetails;
