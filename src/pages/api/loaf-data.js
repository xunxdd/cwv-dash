import loafData from "@assets/sample-data/loaf.json";

export async function get({ params, request }) {
  // Pagination settings
  console.log({ request, params });
  const pageSize = 10; // Number of items per page
  const url = new URL(request.url);
  const pageIndex = parseInt(url.searchParams.get("page") || "1", 10); // Current page number
  console.log({ pageIndex, params });
  // Calculate pagination
  const startIndex = (pageIndex - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const totalPages = Math.ceil(loafData.length / pageSize);
  const paginatedData = loafData.slice(startIndex, endIndex);

  // Return the paginated data as JSON
  return new Response(
    JSON.stringify({
      page: pageIndex,
      totalPages: totalPages,
      data: paginatedData,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
