import {
	type AllDragTypes,
	type CleanupFn,
	type DropTargetAllowedDropEffect,
	type DropTargetAPI,
	type DropTargetArgs,
	type DropTargetGetFeedbackArgs,
	type DropTargetRecord,
	type EventPayloadMap,
	type Input,
} from '../internal-types';
import { combine } from '../public-utils/combine';
import { addAttribute } from '../util/add-attribute';

function copyReverse<Value>(array: Value[]): Value[] {
	return array.slice(0).reverse();
}

export function makeDropTarget<DragType extends AllDragTypes>({
	typeKey,
	defaultDropEffect,
}: {
	typeKey: DragType['type'];
	defaultDropEffect: DropTargetAllowedDropEffect;
}): DropTargetAPI<DragType> {
	const registry = new WeakMap<Element, DropTargetArgs<DragType>>();

	const dropTargetDataAtt = `data-drop-target-for-${typeKey}`;
	const dropTargetSelector = `[${dropTargetDataAtt}]`;

	function addToRegistry(args: DropTargetArgs<DragType>): CleanupFn {
		registry.set(args.element, args);
		return () => registry.delete(args.element);
	}

	function dropTargetForConsumers(args: DropTargetArgs<DragType>) {
		// Guardrail: warn if the draggable element is already registered
		if (process.env.NODE_ENV !== 'production') {
			const existing = registry.get(args.element);
			if (existing) {
				// eslint-disable-next-line no-console
				console.warn(`You have already registered a [${typeKey}] dropTarget on the same element`, {
					existing,
					proposed: args,
				});
			}

			if (args.element instanceof HTMLIFrameElement) {
				// eslint-disable-next-line no-console
				console.warn(
					`
            We recommend not registering <iframe> elements as drop targets
            as it can result in some strange browser event ordering.
          `
						// Removing newlines and excessive whitespace
						.replace(/\s{2,}/g, ' ')
						.trim(),
				);
			}
		}

		return combine(
			addAttribute(args.element, {
				attribute: dropTargetDataAtt,
				value: 'true',
			}),
			addToRegistry(args),
		);
	}

	function getActualDropTargets({
		source,
		target,
		input,
		event,
		result = [],
	}: {
		source: DragType['payload'];
		target: EventTarget | null;
		input: Input;
		event: Event | undefined;
		result?: DropTargetRecord[];
	}): DropTargetRecord[] {
		if (event === undefined) {
      return result;
    }

		if (!(target instanceof Element)) {
			// For "text-selection" drags, the original `target`
			// is not an `Element`, so we need to start looking from
			// the parent element
			if (target instanceof Node) {
				return getActualDropTargets({
					source,
					event,
					target: target.parentElement,
					input,
					result,
				});
			}

			// not sure what we are working with,
			// so we can exit.
			return result;
		}

		const closest = target.closest(dropTargetSelector);

		// Cannot find anything else
		if (closest == null) {
			return result;
		}

		const args: DropTargetArgs<DragType> | undefined = registry.get(closest);

		// error: something had a dropTargetSelector but we could not
		// find a match. For now, failing silently
		if (args == null) {
			return result;
		}

		const feedback: DropTargetGetFeedbackArgs<DragType> = {
			input,
			source,
			element: args.element,
		};

		// if dropping is not allowed, skip this drop target
		// and continue looking up the DOM tree
		if (args.canDrop && !args.canDrop(feedback)) {
			return getActualDropTargets({
				source,
				target: args.element.parentElement,
				input,
				event,
				result,
			});
		}

		// calculate our new record
		const data: Record<string | symbol, unknown> = args.getData?.(feedback) ?? {};
		const dropEffect: DropTargetAllowedDropEffect | null =
			args.getDropEffect?.(feedback) ?? defaultDropEffect;
		const record: DropTargetRecord = {
			data,
			element: args.element,
			dropEffect,
			// we are collecting _actual_ drop targets, so these are
			// being applied _not_ due to stickiness
			isActiveDueToStickiness: false,
		};

		return getActualDropTargets({
			source,
			target: args.element.parentElement,
			input,
			event,
			// Using bubble ordering. Same ordering as `event.getPath()`
			result: [...result, record],
		});
	}

	type DispatchEventArgs<EventName extends keyof EventPayloadMap<DragType>> = {
		eventName: EventName;
		payload: EventPayloadMap<DragType>[EventName];
	};

	function notifyCurrent<EventName extends keyof EventPayloadMap<DragType>>({
		eventName,
		payload,
	}: DispatchEventArgs<EventName>): void {
		for (const record of payload.location.current.dropTargets) {
			const entry = registry.get(record.element);
			const args: EventPayloadMap<DragType>[EventName] = {
				...payload,
				self: record,
			};
			entry?.[eventName]?.(
				// I cannot seem to get the types right here.
				// TS doesn't seem to like that one event can need `nativeSetDragImage`
				// @ts-expect-error
				args,
			);
		}
	}

	const actions: {
		[EventName in keyof EventPayloadMap<DragType>]: (args: DispatchEventArgs<EventName>) => void;
	} = {
		onGenerateDragPreview: notifyCurrent,
		onDrag: notifyCurrent,
		onDragStart: notifyCurrent,
		onDrop: notifyCurrent,
		onDropTargetChange: ({ payload }) => {
			const isCurrent = new Set<Element>(
				payload.location.current.dropTargets.map((record) => record.element),
			);

			const visited = new Set<Element>();
			for (const record of payload.location.previous.dropTargets) {
				visited.add(record.element);
				const entry = registry.get(record.element);
				const isOver: boolean = isCurrent.has(record.element);

				const args = {
					...payload,
					self: record,
				};
				entry?.onDropTargetChange?.(args);

				// if we cannot find the drop target in the current array, then it has been left
				if (!isOver) {
					entry?.onDragLeave?.(args);
				}
			}
			for (const record of payload.location.current.dropTargets) {
				// already published an update to this drop target
				if (visited.has(record.element)) {
					continue;
				}
				// at this point we have a new drop target that is being entered into
				const args = {
					...payload,
					self: record,
				};
				const entry = registry.get(record.element);
				entry?.onDropTargetChange?.(args);
				entry?.onDragEnter?.(args);
			}
		},
	};

	function dispatchEvent<EventName extends keyof EventPayloadMap<DragType>>(
		args: DispatchEventArgs<EventName>,
	): void {
		actions[args.eventName](args);
	}

	function getIsOver({
		source,
		target,
		input,
		event,
		current,
	}: {
		source: DragType['payload'];
		target: EventTarget | null;
		input: Input;
		event: Event | undefined;
		current: DropTargetRecord[];
	}): DropTargetRecord[] {
		const actual: DropTargetRecord[] = getActualDropTargets({
			source,
			target,
			event,
			input,
		});

		// stickiness is only relevant when we have less
		// drop targets than we did before
		if (actual.length >= current.length) {
			return actual;
		}

		// less 'actual' drop targets than before,
		// we need to see if 'stickiness' applies

		// An old drop target will continue to be dropped on if:
		// 1. it has the same parent
		// 2. nothing exists in it's previous index

		const lastCaptureOrdered = copyReverse(current);
		const actualCaptureOrdered = copyReverse(actual);

		const resultCaptureOrdered: DropTargetRecord[] = [];

		for (let index = 0; index < lastCaptureOrdered.length; index++) {
			const last: DropTargetRecord = lastCaptureOrdered[index];
			const fresh: DropTargetRecord | undefined = actualCaptureOrdered[index];

			// if a record is in the new index -> use that
			// it will have the latest data + dropEffect
			if (fresh != null) {
				resultCaptureOrdered.push(fresh);
				continue;
			}

			// At this point we have no drop target in the old spot
			// Check to see if we can use a previous sticky drop target

			// The "parent" is the one inside of `resultCaptureOrdered`
			// (the parent might be a drop target that was sticky)
			const parent: DropTargetRecord | undefined = resultCaptureOrdered[index - 1];
			const lastParent: DropTargetRecord | undefined = lastCaptureOrdered[index - 1];

			// Stickiness is based on parent relationships, so if the parent relationship has change
			// then we can stop our search
			if (parent?.element !== lastParent?.element) {
				break;
			}

			// We need to check whether the old drop target can still be dropped on

			const argsForLast = registry.get(last.element);

			// We cannot drop on a drop target that is no longer mounted
			if (!argsForLast) {
				break;
			}

			const feedback: DropTargetGetFeedbackArgs<DragType> = {
				input,
				source,
				element: argsForLast.element,
			};

			// We cannot drop on a drop target that no longer allows being dropped on
			if (argsForLast.canDrop && !argsForLast.canDrop(feedback)) {
				break;
			}

			// We cannot drop on a drop target that is no longer sticky
			if (!argsForLast.getIsSticky?.(feedback)) {
				break;
			}

			// Note: intentionally not recollecting `getData()` or `getDropEffect()`
			// Previous values for `data` and `dropEffect` will be borrowed
			// This is to prevent things like the 'closest edge' changing when
			// no longer over a drop target.
			// We could change our mind on this behaviour in the future

			resultCaptureOrdered.push({
				...last,
				// making it clear to consumers this drop target is active due to stickiness
				isActiveDueToStickiness: true,
			});
		}

		// return bubble ordered result
		return copyReverse(resultCaptureOrdered);
	}

	return {
		dropTargetForConsumers,
		getIsOver,
		dispatchEvent,
	};
}
