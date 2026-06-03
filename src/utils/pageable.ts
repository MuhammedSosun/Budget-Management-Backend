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
  const parsedPage = parseInt(query.page || "1", 10);
  const parsedSize = parseInt(query.size || "5", 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const size =
    Number.isNaN(parsedSize) || parsedSize < 1
      ? 5
      : Math.min(parsedSize, 50);

  const limit = size;
  const offset = (page - 1) * size;

  return { limit, offset, page, size };
};

export default getPagination;