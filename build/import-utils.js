
const alreadyResolvedMatch = /^(\.{0,2}\/|[a-z]\w*\:)/;  // matches start of './' or 'https:' etc

module.exports = {

  /**
   * Returns whether the given string is a URL or URL-like.
   *
   * @param {string|?URL} cand
   * @return {boolean}
   */
  isUrl(cand) {
    if (cand instanceof URL || cand.startsWith('//')) {
      return true;
    } else if (!cand) {
      return false;
    }

    try {
      new URL(cand);  // doesn't allow "//-prefix"
      return true;
    } catch (e) {
      // ignore
    }
    return false;
  },

  /**
   * Is the passed candidate string already fully resolved?
   *
   * @param {string|?URL} cand
   * @return {boolean}
   */
  alreadyResolved(cand) {
    if (cand instanceof URL) {
      return true;
    } else if (!cand) {
      return false;
    }
    // TODO(samthor): can ES modules import "//domain.com/blah.js"?
    return Boolean(alreadyResolvedMatch.exec(cand));
  },

  /**
   * Builds an ES6 module which simply imports the given targets for their side-effects.
   *
   * @param {...string} resources 
   * @return {string}
   */
  staticImport(...resources) {
    return resources.map((resource) => {
      if (!this.alreadyResolved(resource)) {
        resource = `./${resource}`;
      }
      // TODO(samthor): escape resource.
      return `import '${resource}';\n`;
    }).join('');
  },

};