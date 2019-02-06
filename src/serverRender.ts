function fetchMainPageData() {
  return;
}

export const routes = [
  {
    path: '/',
    exact: true,
    strict: false,
    dataFetcher: fetchMainPageData
  }
];