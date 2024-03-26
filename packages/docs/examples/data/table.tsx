import batteryIcon from '../icons/battery.png';
import cloudIcon from '../icons/cloud.png';
import drillIcon from '../icons/drill.png';
import koalaIcon from '../icons/koala.png';

export type TableRowData = {
  id: string;
  name: string;
  avatarUrl: string;
};

export const tableRows: TableRowData[] = [
  { id: '1', name: 'Battery', avatarUrl: batteryIcon },
  { id: '2', name: 'Cloud', avatarUrl: cloudIcon },
  { id: '3', name: 'Drill', avatarUrl: drillIcon },
  { id: '4', name: 'Koala', avatarUrl: koalaIcon },
];

export type TableColumnData = { id: string; label: string };

export const tableColumns: TableColumnData[] = [
  { id: 'id', label: 'Id' },
  { id: 'name', label: 'Name' },
  { id: 'icon', label: 'Icon' },
];
