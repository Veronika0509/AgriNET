export const handleBackNavigation = (previousPage: string | undefined, setPage: (page: number) => void) => {
  if (previousPage === 'comments') {
    setPage(4); // Comments page
  } else if (previousPage === 'budgetEditor') {
    setPage(5); // Budget editor page
  } else {
    setPage(1); // Default to map page
  }
};
