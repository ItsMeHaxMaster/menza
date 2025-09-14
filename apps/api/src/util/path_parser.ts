export default function pathParser(path: string): string {
  let pathStriped = path.replace(/(\.ts)|(\.js)$/g, '').replace('/routes', '');

  // Replace `/index` if there is stuff before `/`.
  if (pathStriped.match(/(([^/]+)\/index$)/gm))
    pathStriped = pathStriped.replace('/index', '');

  // Only replace `index` if there is nothing before `/`.
  if (pathStriped.match(/(\/(index)$)/gm))
    pathStriped = pathStriped.replace('index', '');

  // Get all params in the path.
  const paramNames = pathStriped.match(/(\[[a-zA-Z0-9]+\])/g);

  // If there are params in the path, replace them with `:paramName`.
  if (paramNames) {
    paramNames.forEach((param) => {
      const paramName = param.replace(/(\[)|(\])/g, '');

      pathStriped = pathStriped.replace(param, `:${paramName}`);
    });
  }

  return pathStriped;
}
