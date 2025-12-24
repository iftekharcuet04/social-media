export type CursorPaginationInput<Cursor> = {
    cursor?: Cursor;
    take?: number;   
    skip?: number; 
  };
  
  export type CursorPaginationResult<T, Cursor> = {
    data: T[];
    nextCursor?: Cursor;
  };
  