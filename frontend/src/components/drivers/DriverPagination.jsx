const DriverPagination = ({ page = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center my-4">
      <button
        className="btn btn-sm mx-1"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>
      <span className="px-2">Page {page} of {totalPages}</span>
      <button
        className="btn btn-sm mx-1"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default DriverPagination;
