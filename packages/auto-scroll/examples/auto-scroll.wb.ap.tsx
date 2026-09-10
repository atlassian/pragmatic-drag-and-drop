import { wb, type WorkbenchExample } from '@atlassian/workbench';

import AxisLockingExample from './axis-locking';
import LazyLoadedExample from './lazy-loaded';
import NestedScrollExample from './nested-scroll';
import OverElementExample from './over-element';
import UnsafeOverflowExample from './unsafe-overflow';
import UnsafeOverflowBoxExample from './unsafe-overflow-box';
import UnsafeOverflowOnlyExample from './unsafe-overflow-only';
import WindowScrollExample from './window-scroll';
import WindowScrollWithScrollContainerExample from './window-scroll-with-scroll-container';

export const AxisLocking: WorkbenchExample = wb(AxisLockingExample);
export const LazyLoaded: WorkbenchExample = wb(LazyLoadedExample);
export const NestedScroll: WorkbenchExample = wb(NestedScrollExample);
export const OverElement: WorkbenchExample = wb(OverElementExample);
export const UnsafeOverflow: WorkbenchExample = wb(UnsafeOverflowExample);
export const UnsafeOverflowBox: WorkbenchExample = wb(UnsafeOverflowBoxExample);
export const UnsafeOverflowOnly: WorkbenchExample = wb(UnsafeOverflowOnlyExample);
export const WindowScroll: WorkbenchExample = wb(WindowScrollExample);
export const WindowScrollWithScrollContainer: WorkbenchExample = wb(
	WindowScrollWithScrollContainerExample,
);
