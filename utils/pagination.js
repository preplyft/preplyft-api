"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationResult = exports.getPagination = void 0;
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '12', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPagination = getPagination;
const buildPaginationResult = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
});
exports.buildPaginationResult = buildPaginationResult;
//# sourceMappingURL=pagination.js.map