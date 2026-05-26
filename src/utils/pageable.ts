interface PageableQuery {
  page?: string;
  size?: string;
  [key: string]: string | undefined;
}

interface PaginationResult {
  limit: number;
  offset: number;
  page: number;
  size: number;
}

const getPagination = (query: PageableQuery): PaginationResult => {
  const page = parseInt(query.page || "1", 10) || 1;
  const size = parseInt(query.size || "5", 10) || 5;

  const limit = size;
  const offset = (page - 1) * size;

  return { limit, offset, page, size };
};

export default getPagination;
