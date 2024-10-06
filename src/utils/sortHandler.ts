// Helper function to build sort criteria dynamically
export const buildSortOption = (sort: string, allowedSortFields: any): any => {
  if (!sort) {
    return { createdAt: -1 };
  }

  const sortFields = sort.split(",");
  const sortCriteria: any = {};

  sortFields.forEach((field: string) => {
    const sortOrder = field.startsWith("-") ? 1 : -1;
    const sortField = field.startsWith("-") ? field.slice(1) : field;

    if (allowedSortFields[sortField]) {
      sortCriteria[allowedSortFields[sortField]] = sortOrder;
    }
  });

  return Object.keys(sortCriteria).length ? sortCriteria : { createdAt: -1 };
};
