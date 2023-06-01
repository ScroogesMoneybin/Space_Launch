const DEFAULT_PAGE_LIMIT = 0; /*In Mongo, using 0 as default page limit of entries will return all the entries on page 1 */
const DEFAULT_PAGE_NUMBER_OF_ENTRIES = 1;

function getPagination (query) {
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER_OF_ENTRIES;
    const skip = (page - 1)*limit;

    return {
        skip,
        limit
    }
}

module.exports = { getPagination }