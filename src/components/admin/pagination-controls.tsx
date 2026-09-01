import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  baseUrl,
}: {
  page: number;
  totalPages: number;
  baseUrl: string;
}) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : 1;
  const next = page < totalPages ? page + 1 : totalPages;

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          render={<Link href={`${baseUrl}?page=${prev}`} />}
          variant="outline"
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          render={<Link href={`${baseUrl}?page=${next}`} />}
          variant="outline"
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Halaman <span className="font-medium">{page}</span> dari{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              render={<Link href={`${baseUrl}?page=${prev}`} />}
              variant="outline"
              disabled={page === 1}
              className="rounded-l-md rounded-r-none border-r-0 focus:z-20"
            >
              Sebelumnya
            </Button>
            <Button
              render={<Link href={`${baseUrl}?page=${next}`} />}
              variant="outline"
              disabled={page === totalPages}
              className="rounded-l-none rounded-r-md focus:z-20"
            >
              Berikutnya
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
