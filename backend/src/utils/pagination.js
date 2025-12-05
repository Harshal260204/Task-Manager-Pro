/**
 * Calculate pagination metadata
 * @param {number} total - Total number of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit) || 1

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    pages,
  }
}

/**
 * Get pagination parameters from query
 * @param {Object} query - Request query object
 * @returns {Object} Pagination parameters { page, limit, skip }
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

