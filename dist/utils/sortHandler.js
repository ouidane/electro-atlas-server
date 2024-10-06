"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSortOption = void 0;
// Helper function to build sort criteria dynamically
const buildSortOption = (sort, allowedSortFields) => {
    if (!sort) {
        return { createdAt: -1 };
    }
    const sortFields = sort.split(",");
    const sortCriteria = {};
    sortFields.forEach((field) => {
        const sortOrder = field.startsWith("-") ? 1 : -1;
        const sortField = field.startsWith("-") ? field.slice(1) : field;
        if (allowedSortFields[sortField]) {
            sortCriteria[allowedSortFields[sortField]] = sortOrder;
        }
    });
    return Object.keys(sortCriteria).length ? sortCriteria : { createdAt: -1 };
};
exports.buildSortOption = buildSortOption;
//# sourceMappingURL=sortHandler.js.map