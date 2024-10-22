// Helper function to build sort criteria dynamically
export const buildSortOption = (
  sort: string,
  allowedSortFields: { [key: string]: string }
): any => {
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

export const buildFilterOption = (
  filters: { [key: string]: string },
  allowedFilterFields: { [key: string]: (value: string) => any }
): any => {
  if (!filters) {
    return {};
  }

  const filterCriteria: any = {};
  for (const [key, value] of Object.entries(filters)) {
    if (key in allowedFilterFields) {
      Object.assign(filterCriteria, allowedFilterFields[key](value));
    }
  }
  return filterCriteria;
};
