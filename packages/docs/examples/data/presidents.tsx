export type President = {
  id: number;
  name: string;
  party: string;
  term: string;
};

export const presidents = [
  {
    id: 1,
    name: 'George Washington',
    party: 'None, Federalist',
    term: '1789-1797',
  },
  {
    id: 2,
    name: 'John Adams',
    party: 'Federalist',
    term: '1797-1801',
  },
  {
    id: 3,
    name: 'Thomas Jefferson',
    party: 'Democratic-Republican',
    term: '1801-1809',
  },
  {
    id: 4,
    name: 'James Madison',
    party: 'Democratic-Republican',
    term: '1809-1817',
  },
  {
    id: 5,
    name: 'James Monroe',
    party: 'Democratic-Republican',
    term: '1817-1825',
  },
  {
    id: 6,
    name: 'John Quincy Adams',
    party: 'Democratic-Republican',
    term: '1825-1829',
  },
  {
    id: 7,
    name: 'Andrew Jackson',
    party: 'Democrat',
    term: '1829-1837',
  },
  {
    id: 8,
    name: 'Martin van Buren',
    party: 'Democrat',
    term: '1837-1841',
  },
  {
    id: 9,
    name: 'William H. Harrison',
    party: 'Whig',
    term: '1841',
  },
  {
    id: 10,
    name: 'John Tyler',
    party: 'Whig',
    term: '1841-1845',
  },
];

export type RowOrder = number[];

export function getInitialRowOrder(): RowOrder {
  return presidents.map((_, index) => index);
}

export type Column = 'name' | 'party' | 'term';

export type ColumnOrder = Column[];

export const columnLabel: Record<Column, string> = {
  name: 'Name',
  party: 'Party',
  term: 'Term',
};

export function getInitialColumnOrder(): ColumnOrder {
  return ['name', 'party', 'term'];
}
