import { Types } from "mongoose";

// Types for filter values and operations
type BaseFilterValue = string | Types.ObjectId | number | boolean | Date;
type FilterValue = BaseFilterValue | BaseFilterValue[];

// MongoDB operators
type RangeOperator = "$gte" | "$lte";
type ArrayOperator = "$in";
type RegexOperator = "$regex";
type MongoOperator = RangeOperator | ArrayOperator | RegexOperator;

// Filter related interfaces
interface FilterHandler {
  (value: string): { [key: string]: any };
}

export interface FilterHandlers {
  [key: string]: FilterHandler;
}

interface RangeFilterValue {
  $gte?: FilterValue;
  $lte?: FilterValue;
}

interface RangeFilters {
  [key: string]: RangeFilterValue;
}

interface FilterOptions {
  [key: string]:
    | RangeFilterValue
    | {
        [K in MongoOperator]?: FilterValue | RegExp;
      };
}

// Types for better type safety and documentation
type SortDirection = 1 | -1;
type SortFields = Record<string, string>;

interface SortOptions {
  [key: string]: SortDirection;
}

interface ParsedSortField {
  field: string;
  direction: SortDirection;
}

/**
 * Builds MongoDB sort criteria from a query string
 */
export const buildSortOption = (
  sort: string | undefined,
  allowedSortFields: SortFields,
  defaultSort: SortOptions = { createdAt: -1 }
): SortOptions => {
  // Return default sort if no sort string provided
  if (!sort?.trim()) {
    return defaultSort;
  }

  // Parse and validate individual sort fields
  const parsedFields = sort
    .split(",")
    .map((field): ParsedSortField | null => {
      const trimmedField = field.trim();
      if (!trimmedField) return null;

      const isAscending = trimmedField.startsWith("-");
      const fieldName = isAscending ? trimmedField.slice(1) : trimmedField;

      // Check if the field is allowed
      const dbField = allowedSortFields[fieldName];
      if (!dbField) return null;

      return {
        field: dbField,
        direction: isAscending ? 1 : -1,
      };
    })
    .filter((field): field is ParsedSortField => field !== null);

  // If no valid sort fields found, return default sort
  if (parsedFields.length === 0) {
    return defaultSort;
  }

  // Build the sort criteria object
  const sortCriteria = parsedFields.reduce<SortOptions>(
    (acc, { field, direction }) => {
      acc[field] = direction;
      return acc;
    },
    {}
  );

  return sortCriteria;
};

export const buildFilterOption = (
  filters: { [key: string]: string } | undefined,
  allowedFilterFields: FilterHandlers
): FilterOptions => {
  if (!filters) {
    return {};
  }

  const filterCriteria: FilterOptions = {};
  const rangeFilters: RangeFilters = {};

  // Process each filter
  for (const [key, value] of Object.entries(filters)) {
    if (!value || !(key in allowedFilterFields)) {
      continue;
    }

    if (isRangeFilter(key)) {
      processRangeFilter(key, value, allowedFilterFields, rangeFilters);
    } else {
      Object.assign(filterCriteria, allowedFilterFields[key](value));
    }
  }

  return mergeFilters(filterCriteria, rangeFilters);
};

/**
 * Checks if a filter key represents a range filter
 */
const isRangeFilter = (key: string): boolean => {
  return (
    key.startsWith("min") ||
    key.startsWith("max") ||
    key.includes("After") ||
    key.includes("Before")
  );
};

/**
 * Processes a range filter and adds it to the rangeFilters object
 */
const processRangeFilter = (
  key: string,
  value: string,
  allowedFilterFields: FilterHandlers,
  rangeFilters: RangeFilters
): void => {
  const filterResult = allowedFilterFields[key](value);
  const baseField = Object.keys(filterResult)[0];
  const operator = getOperatorForRangeFilter(key);
  const processedValue = processRangeFilterValue(key, value);

  if (!rangeFilters[baseField]) {
    rangeFilters[baseField] = {};
  }

  rangeFilters[baseField] = {
    ...rangeFilters[baseField],
    [operator]: processedValue,
  };
};

/**
 * Gets the appropriate operator for a range filter
 */
const getOperatorForRangeFilter = (key: string): RangeOperator => {
  if (key.startsWith("min") || key.includes("After")) {
    return "$gte";
  }
  return "$lte";
};

/**
 * Processes a value for a range filter based on its type
 */
const processRangeFilterValue = (key: string, value: string): FilterValue => {
  if (key.includes("After") || key.includes("Before")) {
    return new Date(value);
  }
  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    throw new Error(`Invalid numeric value for range filter ${key}: ${value}`);
  }
  return numericValue;
};

/**
 * Merges regular filters with range filters
 */
const mergeFilters = (
  filterCriteria: FilterOptions,
  rangeFilters: RangeFilters
): FilterOptions => {
  const mergedFilters = { ...filterCriteria };

  for (const [field, conditions] of Object.entries(rangeFilters)) {
    if (mergedFilters[field]) {
      mergedFilters[field] = { ...mergedFilters[field], ...conditions };
    } else {
      mergedFilters[field] = conditions;
    }
  }

  return mergedFilters;
};
